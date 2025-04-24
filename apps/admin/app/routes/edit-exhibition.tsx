import { Form, redirect, useNavigate } from "react-router";
import { getExhibition, updateExhibition } from "../data";
import type { Route } from "./+types/edit-exhibition";

export async function action({ params, request }: Route.ActionArgs) {
	const formData = await request.formData();
	const updates = Object.fromEntries(formData);
	await updateExhibition(Number(params.exhibitionId), updates);
	return redirect(`/exhibitions/${params.exhibitionId}`);
}

export async function loader({ params }: Route.LoaderArgs) {
	const exhibition = await getExhibition(Number(params.exhibitionId));
	if (!exhibition) {
		throw new Response("Not Found", { status: 404 });
	}
	return { exhibition };
}

export default function EditExhibition({ loaderData }: Route.ComponentProps) {
	const navigate = useNavigate();
	const { exhibition } = loaderData;

	return (
		<Form key={exhibition.id} id="contact-form" method="post">
			<p>
				<span>Name</span>
				<input
					aria-label="Exhibition name"
					defaultValue={exhibition.name}
					name="name"
					placeholder="Exhibition name"
					type="text"
				/>
			</p>
			<label>
				<span>Exhibition URL</span>
				<input
					aria-label="Exhibition URL"
					defaultValue={exhibition.url}
					name="url"
					placeholder="https://exhibition.com"
					type="text"
				/>
			</label>
			<label>
				<span>Description</span>
				<textarea
					defaultValue={exhibition.description}
					name="description"
					rows={6}
				/>
			</label>
			<p>
				<button type="submit">Save</button>
				<button onClick={() => navigate(-1)} type="button">
					Cancel
				</button>
			</p>
		</Form>
	);
}
