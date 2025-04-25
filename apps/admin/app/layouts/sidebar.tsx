import { useEffect } from "react";
import {
	Form,
	Link,
	NavLink,
	Outlet,
	useNavigation,
	useSubmit,
} from "react-router";
import { getExhibitions } from "../data";
import type { Route } from "./+types/sidebar";

export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const q = url.searchParams.get("q");
	const exhibitions = await getExhibitions(q);
	return { exhibitions, q };
}

export default function SidebarLayout({ loaderData }: Route.ComponentProps) {
	const navigation = useNavigation();
	const submit = useSubmit();
	const { exhibitions, q } = loaderData;

	const searching =
		navigation.location &&
		new URLSearchParams(navigation.location.search).has("q");

	useEffect(() => {
		const searchField = document.getElementById("q");
		if (searchField instanceof HTMLInputElement) {
			searchField.value = q || "";
		}
	}, [q]);

	return (
		<>
			<div id="sidebar">
				<h1>
					<Link to="about">Exhibition Finder</Link>
				</h1>
				<div>
					<Form
						id="search-form"
						role="search"
						onChange={(event) => {
							const isFirstSearch = q === null;
							submit(event.currentTarget, {
								replace: !isFirstSearch,
							});
						}}
					>
						<input
							defaultValue={q || ""}
							className={searching ? "loading" : ""}
							aria-label="Search exhibitions"
							id="q"
							name="q"
							placeholder="Search"
							type="search"
						/>
						<div aria-hidden hidden={!searching} id="search-spinner" />
					</Form>
					<Form method="post">
						<button style={{ cursor: "pointer" }} type="submit">
							New
						</button>
					</Form>
				</div>
				<nav>
					{exhibitions.length ? (
						<ul>
							{exhibitions.map((exhibition) => (
								<li key={exhibition.id}>
									<NavLink
										className={({ isActive, isPending }) =>
											isActive ? "active" : isPending ? "pending" : ""
										}
										to={`exhibitions/${exhibition.id}`}
									>
										{exhibition.name ? (
											<>{exhibition.name}</>
										) : (
											<i>Untitled Exhibition</i>
										)}
										{exhibition.recommended ? <span>★</span> : null}
									</NavLink>
								</li>
							))}
						</ul>
					) : (
						<p>
							<i>No exhibitions</i>
						</p>
					)}
				</nav>
			</div>
			<div
				id="detail"
				className={
					navigation.state === "loading" && !searching ? "loading" : ""
				}
			>
				<Outlet />
			</div>
		</>
	);
}
