import express from "express";
const router = express.Router();

router.post("/", (req, res) => {
    const { feedback, rating } = req.body;

    console.log("Received:", feedback, rating);

    res.json({ success: true });
});

export default router;