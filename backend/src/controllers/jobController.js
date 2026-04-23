import Job from "../models/Job.js";
import User from "../models/User.js";
import { sendReminderEmail } from "../utils/email.js";

const validStatuses = new Set(["applied", "interview", "rejected", "offer"]);

const getUserId = (req) => req.user?.userId;

const validateStatus = (status) =>
  !status || validStatuses.has(String(status).toLowerCase());

export const createJob = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, company, status, deadline, reminderAt } = req.body || {};

    if (!title || !company || !deadline) {
      return res
        .status(400)
        .json({ message: "Title, company, and deadline are required" });
    }

    if (!validateStatus(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const deadlineDate = new Date(deadline);
    if (Number.isNaN(deadlineDate.valueOf())) {
      return res.status(400).json({ message: "Invalid deadline value" });
    }

    let reminderDate = reminderAt ? new Date(reminderAt) : null;
    if (reminderAt && Number.isNaN(reminderDate.valueOf())) {
      return res.status(400).json({ message: "Invalid reminder value" });
    }
    if (!reminderDate) {
      reminderDate = new Date(deadlineDate.getTime() - 24 * 60 * 60 * 1000);
    }

    const job = await Job.create({
      title: String(title).trim(),
      company: String(company).trim(),
      status: status ? String(status).toLowerCase() : undefined,
      deadline: deadlineDate,
      reminderAt: reminderDate,
      user: userId,
    });

    return res.status(201).json({ job });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getJobs = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const { search, status, deadline } = req.query;

    let query = { user: req.user.id };

    // Search (title, company, deadline)
    if (search) {
      const searchConditions = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];

      const dateMatch = /^\d{4}-\d{2}-\d{2}$/.test(search);
      if (dateMatch) {
        const [year, month, day] = search.split("-").map(Number);
        const start = new Date(Date.UTC(year, month - 1, day));
        const end = new Date(Date.UTC(year, month - 1, day + 1));
        searchConditions.push({ deadline: { $gte: start, $lt: end } });
      }

      query.$or = searchConditions;
    }

    // Filter (status)
    if (status && status !== "all") {
      query.status = status;
    }

    // Filter (deadline)
    if (deadline) {
      const deadlineDate = new Date(deadline);
      if (!Number.isNaN(deadlineDate.valueOf())) {
        const start = new Date(
          Date.UTC(
            deadlineDate.getUTCFullYear(),
            deadlineDate.getUTCMonth(),
            deadlineDate.getUTCDate()
          )
        );
        const end = new Date(
          Date.UTC(
            deadlineDate.getUTCFullYear(),
            deadlineDate.getUTCMonth(),
            deadlineDate.getUTCDate() + 1
          )
        );
        query.deadline = { $gte: start, $lt: end };
      }
    }

    const total = await Job.countDocuments(query);

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      total,
      page,
      pages: Math.ceil(total / limit),
      jobs,
    });
  } catch (err) {
    next(err);
  }
};

export const updateJob = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params || {};
    const { title, company, status, deadline, reminderAt } = req.body || {};

    if (!id) {
      return res.status(400).json({ message: "Job id is required" });
    }

    if (status && !validateStatus(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const update = {};
    if (title !== undefined) {
      update.title = String(title).trim();
    }
    if (company !== undefined) {
      update.company = String(company).trim();
    }
    if (status !== undefined) {
      update.status = String(status).toLowerCase();
    }
    if (deadline !== undefined) {
      const deadlineDate = new Date(deadline);
      if (Number.isNaN(deadlineDate.valueOf())) {
        return res.status(400).json({ message: "Invalid deadline value" });
      }
      update.deadline = deadlineDate;
    }
    if (reminderAt !== undefined) {
      const reminderDate = reminderAt ? new Date(reminderAt) : null;
      if (reminderAt && Number.isNaN(reminderDate.valueOf())) {
        return res.status(400).json({ message: "Invalid reminder value" });
      }
      update.reminderAt = reminderDate;
    }

    const job = await Job.findOneAndUpdate(
      { _id: id, user: userId },
      update,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json({ job });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params || {};
    if (!id) {
      return res.status(400).json({ message: "Job id is required" });
    }

    const job = await Job.findOneAndDelete({ _id: id, user: userId });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json({ message: "Job deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const sendTestReminderEmail = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId).select("email name");
    if (!user?.email) {
      return res.status(404).json({ message: "User email not found" });
    }

    const nowLabel = new Date().toLocaleString();

    await sendReminderEmail({
      to: user.email,
      name: user.name,
      job: { company: "Test Company" },
      deadline: nowLabel,
    });

    return res.status(200).json({ message: "Test email sent" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};
