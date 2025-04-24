import type { RouteConfig } from "@react-router/dev/routes";
import { index, layout, route } from "@react-router/dev/routes";

export default [
	layout("layouts/sidebar.tsx", [
		index("routes/home.tsx"),
		route("exhibitions/:exhibitionId", "routes/exhibition.tsx"),
		route("exhibitions/:exhibitionId/edit", "routes/edit-exhibition.tsx"),
		route("exhibitions/:exhibitionId/destroy", "routes/destroy-exhibition.tsx"),
	]),
	route("about", "routes/about.tsx"),
] satisfies RouteConfig;
