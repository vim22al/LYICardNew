import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { Plan } from '../models/plan.model.js';
import { User } from '../models/user.model.js';

export class AdminPlanController {
  public listPlans = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const plans = await Plan.find().sort({ price: 1 });
      res.json(plans);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public createPlan = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const planData = req.body;
      const plan = await Plan.create(planData);
      res.status(201).json(plan);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public updatePlan = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { planId } = req.params;
      const updates = req.body;

      const plan = await Plan.findByIdAndUpdate(
        planId,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!plan) {
        res.status(404).json({ error: 'Plan not found' });
        return;
      }

      res.json(plan);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public deletePlan = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { planId } = req.params;

      const plan = await Plan.findById(planId);
      if (!plan) {
        res.status(404).json({ error: 'Plan not found' });
        return;
      }

      // Check if any users are using this plan name
      // We check by name because User model has 'plan' as a string field
      const userCount = await User.countDocuments({ plan: plan.name });

      if (userCount > 0) {
        res.status(400).json({ 
          error: `Cannot delete plan because it is currently used by ${userCount} user(s).` 
        });
        return;
      }

      await Plan.findByIdAndDelete(planId);
      res.json({ message: 'Plan deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
