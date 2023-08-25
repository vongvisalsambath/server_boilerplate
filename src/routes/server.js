import { Router } from "express";

export default ({ logger }) => {
  const router = new Router();

  // router.post(api.refresh, async (req, res) => {
  //   try {
  //     const { server } = req.app.locals;

  //     await server.loadStore();

  //     res.status(200).json({ status: "success" });
  //   } catch (err) {
  //     res.status(200).json({ status: "failed", message: err.message });
  //   }
  // });

  return router;
};
