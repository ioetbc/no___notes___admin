import { Form, useFetcher } from "react-router";
import {
	type ExhibitionRecord,
	getExhibition,
	updateExhibition,
} from "../data";
import type { Route } from "./+types/exhibition";

export async function loader({ params }: Route.LoaderArgs) {
	const exhibition_id = Number(params.exhibition_id);

	if (Number.isNaN(exhibition_id)) {
		throw new Response("Invalid exhibition ID", { status: 400 });
	}

	const exhibition = await getExhibition(exhibition_id);
	if (!exhibition) {
		throw new Response("Not Found", { status: 404 });
	}

	return { exhibition };
}

export default function Exhibition({ loaderData }: Route.ComponentProps) {
	const { exhibition } = loaderData;

	const formatDate = (dateString?: string) => {
		if (!dateString) return "Not set";
		return new Date(dateString).toLocaleDateString("en-GB", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatDateWithTime = (dateString?: string) => {
		if (!dateString) return "Not set";
		return new Date(dateString).toLocaleString("en-GB", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const lf = new Intl.ListFormat("en-GB", {
		style: "long",
		type: "conjunction",
	});

	return (
		<div
			id="exhibition"
			style={{
				display: "flex",
				flexDirection: "column",
				gap: "2rem",
				padding: "1.5rem",
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "1.5rem",
					alignItems: "flex-start",
				}}
			>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						width: "100%",
					}}
				>
					<h1
						style={{
							fontSize: "2rem",
							margin: 0,
							fontWeight: 600,
							color: "#333",
							display: "flex",
							alignItems: "center",
							gap: "0.5rem",
						}}
					>
						{exhibition.name} <Favorite exhibition={exhibition} />
					</h1>
					<div
						className="exhibition-actions"
						style={{
							display: "flex",
							gap: "0.75rem",
						}}
					>
						<Form action="edit">
							<button
								type="submit"
								style={{
									background: "#3182ce",
									color: "white",
									border: "none",
									padding: "0.5rem 1rem",
									borderRadius: "4px",
									cursor: "pointer",
									fontWeight: 500,
								}}
							>
								Edit
							</button>
						</Form>
						<Form
							action="destroy"
							method="post"
							onSubmit={(event) => {
								if (
									!confirm("Please confirm you want to delete this exhibition.")
								) {
									event.preventDefault();
								}
							}}
						>
							<button
								type="submit"
								style={{
									background: "#e53e3e",
									color: "white",
									border: "none",
									padding: "0.5rem 1rem",
									borderRadius: "4px",
									cursor: "pointer",
									fontWeight: 500,
								}}
							>
								Delete
							</button>
						</Form>
					</div>
				</div>
			</div>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 4fr",
					gap: "2rem",
				}}
			>
				<div
					style={{
						flex: "1 1 400px",
						overflow: "hidden",
					}}
				>
					{exhibition.images.map((image) => (
						<img
							key={image.id}
							alt={`${exhibition.name} exhibition`}
							src={image.image_url}
							style={{
								width: "100%",
								height: "auto",
								borderRadius: "8px",
							}}
						/>
					))}
				</div>

				<div
					style={{
						flex: "1 1 400px",
						display: "flex",
						flexDirection: "column",
						gap: "1.5rem",
					}}
				>
					<div
						style={{
							background: "#f7fafc",
							padding: "1.5rem",
							borderRadius: "8px",
							border: "1px solid #e2e8f0",
						}}
					>
						<h2
							style={{
								fontSize: "1.25rem",
								margin: "0 0 1rem 0",
								fontWeight: 600,
								color: "#2d3748",
							}}
						>
							Exhibition Dates
						</h2>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "auto 1fr",
								gap: "0.5rem 1rem",
							}}
						>
							<span style={{ fontWeight: 500, color: "#4a5568" }}>Start:</span>
							<span>{formatDate(exhibition.start_date)}</span>
							<span style={{ fontWeight: 500, color: "#4a5568" }}>End:</span>
							<span>{formatDate(exhibition.end_date)}</span>
						</div>
					</div>
					<div
						style={{
							background: "#f7fafc",
							padding: "1.5rem",
							borderRadius: "8px",
							border: "1px solid #e2e8f0",
						}}
					>
						<h2
							style={{
								fontSize: "1.25rem",
								margin: "0 0 1rem 0",
								fontWeight: 600,
								color: "#2d3748",
							}}
						>
							Private View
						</h2>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "auto 1fr",
								gap: "0.5rem 1rem",
							}}
						>
							<span style={{ fontWeight: 500, color: "#4a5568" }}>Start:</span>
							<span>
								{formatDateWithTime(exhibition.private_view_start_date)}
							</span>
							<span style={{ fontWeight: 500, color: "#4a5568" }}>End:</span>
							<span>
								{formatDateWithTime(exhibition.private_view_end_date)}
							</span>
						</div>
					</div>

					<div
						style={{
							background: "#f7fafc",
							padding: "1.5rem",
							borderRadius: "8px",
							border: "1px solid #e2e8f0",
						}}
					>
						<h2
							style={{
								fontSize: "1.25rem",
								margin: "0 0 1rem 0",
								fontWeight: 600,
								color: "#2d3748",
							}}
						>
							Exhibition Description
						</h2>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "auto 1fr",
								gap: "0.5rem 1rem",
							}}
						>
							<span>{exhibition.description}</span>
						</div>
					</div>

					<div
						style={{
							background: "#f7fafc",
							padding: "1.5rem",
							borderRadius: "8px",
							border: "1px solid #e2e8f0",
						}}
					>
						<h2
							style={{
								fontSize: "1.25rem",
								margin: "0 0 1rem 0",
								fontWeight: 600,
								color: "#2d3748",
							}}
						>
							Featured Artists
						</h2>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "auto 1fr",
								gap: "0.5rem 1rem",
							}}
						>
							<span>
								{exhibition.featured_artists.length > 0
									? lf.format(
											exhibition.featured_artists.map((a) => a.artist.name),
										)
									: "None"}
							</span>
						</div>
					</div>

					{exhibition.url && (
						<div
							style={{
								background: "#f7fafc",
								padding: "1.5rem",
								borderRadius: "8px",
								border: "1px solid #e2e8f0",
							}}
						>
							<h2
								style={{
									fontSize: "1.25rem",
									margin: "0 0 1rem 0",
									fontWeight: 600,
									color: "#2d3748",
								}}
							>
								Website
							</h2>
							<a
								href={exhibition.url}
								target="_blank"
								rel="noreferrer"
								style={{
									color: "#3182ce",
									textDecoration: "none",
									wordBreak: "break-all",
								}}
							>
								{exhibition.url}
							</a>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export async function action({ params, request }: Route.ActionArgs) {
	const exhibition_id = Number(params.exhibition_id);

	if (Number.isNaN(exhibition_id)) {
		throw new Response("Invalid exhibition ID", { status: 400 });
	}

	const formData = await request.formData();
	return updateExhibition(exhibition_id, {
		recommended: formData.get("recommended") === "true",
	});
}

function Favorite({
	exhibition,
}: {
	exhibition: Pick<ExhibitionRecord, "recommended">;
}) {
	const fetcher = useFetcher();
	const favorite = fetcher.formData
		? fetcher.formData.get("recommended") === "true"
		: exhibition.recommended;

	return (
		<fetcher.Form method="post">
			<button
				aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
				name="recommended"
				value={favorite ? "false" : "true"}
				style={{
					cursor: "pointer",
					fontSize: "1.5rem",
					color: favorite ? "#f6ad55" : "#a0aec0",
				}}
			>
				{favorite ? "★" : "☆"}
			</button>
		</fetcher.Form>
	);
}
