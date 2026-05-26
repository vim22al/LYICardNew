import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { Contact } from '../models/contact.model.js';
import { Template } from '../models/template.model.js';
import { publishToExtractionQueue } from '../../infrastructure/queue/rabbitmq.js';
import { singleEmailQueue } from '../../infrastructure/queue/bullmq.js';
import { EXTRACTION_PROMPT } from '../../prompts/extraction.prompt.js';

export const scanCard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    let imageBase64 = req.body.image;

    // Handle file upload if present via multer
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;
      imageBase64 = `data:${mimeType};base64,${base64}`;
    }

    if (!imageBase64) {
       res.status(400).json({ error: 'Image is required' });
       return;
    }

    // 1. Create pending contact record
    const contact = await Contact.create({
      userId,
      name: 'Processing...', // Placeholder
      rawImage: imageBase64,
      status: 'processing',
    });

    // 2. Publish to RabbitMQ for extraction
    await publishToExtractionQueue({
      documentId: contact._id,
      image: imageBase64,
      prompt: EXTRACTION_PROMPT,
    });

    res.status(202).json({
      message: 'Extraction started',
      contactId: contact._id,
      status: 'processing',
    });
  } catch (error) {
    next(error);
  }
};

export const getContacts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const { search, status, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query: any = { userId, isDeleted: false };

    // 1. Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    // 2. Search by name, company, or email if provided
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { name: searchRegex },
        { company: searchRegex },
        { email: searchRegex }
      ];
    }

    // 3. Build sort options
    const sortOptions: any = {};
    sortOptions[sortBy as string] = order === 'desc' ? -1 : 1;

    const contacts = await Contact.find(query).sort(sortOptions);
    res.json(contacts);
  } catch (error) {
    next(error);
  }
};

export const getContactById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findOne({ _id: id, userId: req.user._id, isDeleted: false });
    
    if (!contact) {
       res.status(404).json({ error: 'Contact not found' });
       return;
    }

    res.json(contact);
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Prevent sensitive fields from being updated directly if needed
    delete updates.userId;
    delete updates._id;

    const contact = await Contact.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: updates },
      { new: true }
    );

    if (!contact) {
       res.status(404).json({ error: 'Contact not found' });
       return;
    }

    res.json(contact);
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!contact) {
       res.status(404).json({ error: 'Contact not found' });
       return;
    }

    res.json({ message: 'Contact deleted successfully (soft delete)' });
  } catch (error) {
    next(error);
  }
};

export const sendDefaultEmail = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // 1. Verify contact exists and belongs to user
    const contact = await Contact.findOne({ _id: id, userId, isDeleted: false });
    if (!contact) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    if (!contact.email) {
      res.status(400).json({ error: 'Contact has no email address' });
      return;
    }

    // 2. Find user's default email template
    const defaultTemplate = await Template.findOne({ 
      userId, 
      type: 'email', 
      isDefault: true, 
      isDeleted: false 
    });

    if (!defaultTemplate) {
      res.status(400).json({ error: 'No default email template found. Please set a template as default first.' });
      return;
    }

    // 3. Queue the job
    const job = await singleEmailQueue.add(`email-${contact._id}`, {
      contactId: contact._id,
      templateId: defaultTemplate._id
    });

    res.json({ 
      message: 'Email queued successfully', 
      jobId: job.id 
    });
  } catch (error) {
    next(error);
  }
};
