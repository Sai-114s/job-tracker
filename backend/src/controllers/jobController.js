import Job from "../models/Job.js";

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

    const { title, company, status } = req.body || {};

    if (!title || !company) {
      return res.status(400).json({ message: "Title and company are required" });
    }

    if (!validateStatus(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const job = await Job.create({
      title: String(title).trim(),
      company: String(company).trim(),
      status: status ? String(status).toLowerCase() : undefined,
      user: userId,
    });

    return res.status(201).json({ job });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getJobs = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const jobs = await Job.find({ user: userId }).sort({ createdAt: -1 });
    return res.status(200).json({ count: jobs.length, jobs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const updateJob = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params || {};
    const { title, company, status } = req.body || {};

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
