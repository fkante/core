import {
  adminBriefIndexRoute,
  adminContentIndexRoute,
  adminProjectIndexRoute,
  adminRoute,
  adminUserIndexRoute,
} from "./adminRoutes";
import {
  briefIndexRoute,
  forgotPasswordRoute,
  homeRoute,
  loginRoute,
  projectIndexRoute,
  registerRoute,
  resetPasswordRoute,
  signInRoute,
  verifyEmailRoute,
} from "./kreatorRoutes";
import { authRoute, authenticatedRoute, rootRoute } from ".";

const routeTree = rootRoute.addChildren([
  authenticatedRoute.addChildren([
    homeRoute,
    briefIndexRoute,
    projectIndexRoute,
    adminRoute.addChildren([
      adminBriefIndexRoute,
      adminProjectIndexRoute,
      adminContentIndexRoute,
      adminUserIndexRoute,
      // Add routes like admin/user/[id], admin/brief/[id] here
    ]),
    // Add routes like /user/profile, /project/[id] here
  ]),
  authRoute.addChildren([
    forgotPasswordRoute,
    resetPasswordRoute,
    loginRoute,
    registerRoute,
    signInRoute,
    verifyEmailRoute,
  ]),
]);

export default routeTree;
