import { Template } from '../models/template.model.js';
export const getTemplates = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { type, search } = req.query;
        const query = { userId, isDeleted: false };
        if (type && type !== 'all') {
            query.type = type;
        }
        if (search) {
            query.name = new RegExp(search, 'i');
        }
        const templates = await Template.find(query).sort({ updatedAt: -1 });
        res.json(templates);
    }
    catch (error) {
        next(error);
    }
};
export const getTemplateById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const template = await Template.findOne({ _id: id, userId: req.user._id, isDeleted: false });
        if (!template) {
            res.status(404).json({ error: 'Template not found' });
            return;
        }
        res.json(template);
    }
    catch (error) {
        next(error);
    }
};
export const createTemplate = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const data = req.body;
        // Handle attachments from multer
        const files = req.files;
        const attachments = files?.map(file => ({
            filename: file.originalname,
            content: file.buffer,
            contentType: file.mimetype,
            size: file.size
        })) || [];
        // If setting as default, unset other defaults of the same type
        const isDefault = String(data.isDefault) === 'true';
        if (isDefault) {
            await Template.updateMany({ userId, type: data.type || 'email', isDeleted: false }, { $set: { isDefault: false } });
        }
        data.isDefault = isDefault;
        const template = await Template.create({
            ...data,
            attachments,
            userId,
        });
        res.status(201).json(template);
    }
    catch (error) {
        next(error);
    }
};
export const updateTemplate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const userId = req.user._id;
        delete updates.userId;
        delete updates._id;
        // Handle attachments
        const existingTemplate = await Template.findOne({ _id: id, userId, isDeleted: false });
        if (!existingTemplate) {
            res.status(404).json({ error: 'Template not found' });
            return;
        }
        const existingAttachmentIds = Array.isArray(req.body.existingAttachmentIds)
            ? req.body.existingAttachmentIds
            : req.body.existingAttachmentIds
                ? [req.body.existingAttachmentIds]
                : [];
        const keptAttachments = existingTemplate.attachments.filter(att => existingAttachmentIds.includes(att._id?.toString()));
        const newFiles = req.files;
        const newAttachments = newFiles?.map(file => ({
            filename: file.originalname,
            content: file.buffer,
            contentType: file.mimetype,
            size: file.size
        })) || [];
        updates.attachments = [...keptAttachments, ...newAttachments];
        // If setting as default, unset other defaults of the same type
        const isDefault = String(updates.isDefault) === 'true';
        if (isDefault) {
            const type = updates.type || existingTemplate.type;
            await Template.updateMany({ userId, type, isDeleted: false, _id: { $ne: id } }, { $set: { isDefault: false } });
        }
        updates.isDefault = isDefault;
        const template = await Template.findOneAndUpdate({ _id: id, userId, isDeleted: false }, { $set: updates }, { new: true });
        if (!template) {
            res.status(404).json({ error: 'Template not found' });
            return;
        }
        res.json(template);
    }
    catch (error) {
        next(error);
    }
};
export const deleteTemplate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const template = await Template.findOneAndUpdate({ _id: id, userId: req.user._id }, { $set: { isDeleted: true } }, { new: true });
        if (!template) {
            res.status(404).json({ error: 'Template not found' });
            return;
        }
        res.json({ message: 'Template deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
