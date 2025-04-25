import {
	type RouteConfig,
	index,
	layout,
	route,
} from "@react-router/dev/routes";

export default [
	layout("layouts/sidebar.tsx", [
		index("routes/home.tsx"),
		route("exhibitions/:exhibition_id", "routes/exhibition.tsx"),
		route("exhibitions/:exhibition_id/edit", "routes/edit-exhibition.tsx"),
		route(
			"exhibitions/:exhibition_id/destroy",
			"routes/destroy-exhibition.tsx",
		),
	]),
	route("about", "routes/about.tsx"),
] satisfies RouteConfig;
