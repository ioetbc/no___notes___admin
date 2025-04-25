import { Form, redirect, useNavigate } from "react-router";
import { getExhibition, updateExhibition } from "../data";
import type { Route } from "./+types/exhibition";

// TODO: should be actionArgs
export async function action({ params, request }: Route.LoaderArgs) {
	const formData = await request.formData();
	const updates = Object.fromEntries(formData);
	
	// Process dates to ensure they have proper ISO format
	if (updates.private_view_start_date && typeof updates.private_view_start_date === 'string') {
		updates.private_view_start_date = new Date(updates.private_view_start_date).toISOString();
	}
	
	if (updates.private_view_end_date && typeof updates.private_view_end_date === 'string') {
		updates.private_view_end_date = new Date(updates.private_view_end_date).toISOString();
	}
	
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

	// Helper functions to format date and time for input fields
	const formatDateForInput = (dateString?: string) => {
		if (!dateString) return "";
		return new Date(dateString).toISOString().split("T")[0];
	};

	const formatTimeForInput = (dateString?: string) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		// Format time as HH:MM
		return date.toTimeString().substring(0, 5);
	};

	const combineDateTime = (dateValue: string, timeValue: string) => {
		if (!dateValue) return "";
		// If time is not provided, default to midnight
		const time = timeValue || "00:00";
		return `${dateValue}T${time}`;
	};

	return (
		<div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1rem" }}>
			<h1
				style={{ fontSize: "1.75rem", marginBottom: "1.5rem", fontWeight: 600 }}
			>
				Edit Exhibition: {exhibition.name}
			</h1>

			<Form
				key={exhibition.id}
				id="exhibition-form"
				method="post"
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "1.5rem",
					backgroundColor: "#f7fafc",
					padding: "2rem",
					borderRadius: "8px",
					border: "1px solid #e2e8f0",
				}}
			>
				<div className="form-group">
					<label style={labelStyle}>
						<span style={labelTextStyle}>Name</span>
						<input
							aria-label="Exhibition name"
							defaultValue={exhibition.name}
							name="name"
							placeholder="Exhibition name"
							type="text"
							style={inputStyle}
						/>
					</label>
				</div>

				<div className="form-group">
					<label style={labelStyle}>
						<span style={labelTextStyle}>Exhibition URL</span>
						<input
							aria-label="Exhibition URL"
							defaultValue={exhibition.url}
							name="url"
							placeholder="https://exhibition.com"
							type="text"
							style={inputStyle}
						/>
					</label>
				</div>

				<div
					style={{
						padding: "1.5rem",
						borderRadius: "8px",
						border: "1px solid #e2e8f0",
						backgroundColor: "white",
					}}
				>
					<h2
						style={{
							fontSize: "1.25rem",
							marginBottom: "1rem",
							fontWeight: 600,
							color: "#2d3748",
						}}
					>
						Exhibition Dates
					</h2>
					<div style={{ display: "flex", gap: "1rem" }}>
						<label style={{ ...labelStyle, flex: 1 }}>
							<span style={labelTextStyle}>Start Date</span>
							<input
								aria-label="Exhibition start date"
								defaultValue={formatDateForInput(exhibition.start_date)}
								name="start_date"
								type="date"
								style={inputStyle}
							/>
						</label>
						<label style={{ ...labelStyle, flex: 1 }}>
							<span style={labelTextStyle}>End Date</span>
							<input
								aria-label="Exhibition end date"
								defaultValue={formatDateForInput(exhibition.end_date)}
								name="end_date"
								type="date"
								style={inputStyle}
							/>
						</label>
					</div>
				</div>

				<div
					style={{
						padding: "1.5rem",
						borderRadius: "8px",
						border: "1px solid #e2e8f0",
						backgroundColor: "white",
					}}
				>
					<h2
						style={{
							fontSize: "1.25rem",
							marginBottom: "1rem",
							fontWeight: 600,
							color: "#2d3748",
						}}
					>
						Private View
					</h2>
					<div style={{ display: "flex", gap: "1rem" }}>
						<div style={{ flex: 1 }}>
							<label style={labelStyle}>
								<span style={labelTextStyle}>Start Date</span>
								<input
									aria-label="Private view start date"
									defaultValue={formatDateForInput(exhibition.private_view_start_date)}
									id="private_view_start_date"
									type="date"
									style={inputStyle}
									onChange={(e) => {
										const dateValue = e.target.value;
										const timeValue = (document.getElementById('private_view_start_time') as HTMLInputElement).value;
										(document.getElementById('private_view_start_date_hidden') as HTMLInputElement).value = 
											combineDateTime(dateValue, timeValue);
									}}
								/>
							</label>
							<label style={{ ...labelStyle, marginTop: "0.5rem" }}>
								<span style={labelTextStyle}>Start Time</span>
								<input
									aria-label="Private view start time"
									defaultValue={formatTimeForInput(exhibition.private_view_start_date)}
									id="private_view_start_time"
									type="time"
									style={inputStyle}
									onChange={(e) => {
										const timeValue = e.target.value;
										const dateValue = (document.getElementById('private_view_start_date') as HTMLInputElement).value;
										(document.getElementById('private_view_start_date_hidden') as HTMLInputElement).value = 
											combineDateTime(dateValue, timeValue);
									}}
								/>
							</label>
							<input 
								type="hidden"
								name="private_view_start_date"
								id="private_view_start_date_hidden"
								defaultValue={exhibition.private_view_start_date ? new Date(exhibition.private_view_start_date).toISOString() : ''}
							/>
						</div>
						<div style={{ flex: 1 }}>
							<label style={labelStyle}>
								<span style={labelTextStyle}>End Date</span>
								<input
									aria-label="Private view end date"
									defaultValue={formatDateForInput(exhibition.private_view_end_date)}
									id="private_view_end_date"
									type="date"
									style={inputStyle}
									onChange={(e) => {
										const dateValue = e.target.value;
										const timeValue = (document.getElementById('private_view_end_time') as HTMLInputElement).value;
										(document.getElementById('private_view_end_date_hidden') as HTMLInputElement).value = 
											combineDateTime(dateValue, timeValue);
									}}
								/>
							</label>
							<label style={{ ...labelStyle, marginTop: "0.5rem" }}>
								<span style={labelTextStyle}>End Time</span>
								<input
									aria-label="Private view end time"
									defaultValue={formatTimeForInput(exhibition.private_view_end_date)}
									id="private_view_end_time"
									type="time"
									style={inputStyle}
									onChange={(e) => {
										const timeValue = e.target.value;
										const dateValue = (document.getElementById('private_view_end_date') as HTMLInputElement).value;
										(document.getElementById('private_view_end_date_hidden') as HTMLInputElement).value = 
											combineDateTime(dateValue, timeValue);
									}}
								/>
							</label>
							<input 
								type="hidden"
								name="private_view_end_date"
								id="private_view_end_date_hidden"
								defaultValue={exhibition.private_view_end_date ? new Date(exhibition.private_view_end_date).toISOString() : ''}
							/>
						</div>
					</div>
				</div>

				<div className="form-group">
					<label style={labelStyle}>
						<span style={labelTextStyle}>Description</span>
						<textarea
							defaultValue={exhibition.description}
							name="description"
							rows={6}
							style={{
								...inputStyle,
								height: "auto",
								minHeight: "120px",
								fontFamily: "inherit",
							}}
						/>
					</label>
				</div>

				<div
					style={{
						display: "flex",
						gap: "1rem",
						marginTop: "1rem",
						justifyContent: "flex-end",
					}}
				>
					<button
						onClick={() => navigate(-1)}
						type="button"
						style={{
							padding: "0.5rem 1rem",
							borderRadius: "4px",
							border: "1px solid #cbd5e0",
							backgroundColor: "white",
							color: "#4a5568",
							fontWeight: 500,
							cursor: "pointer",
						}}
					>
						Cancel
					</button>
					<button
						type="submit"
						style={{
							padding: "0.5rem 1.5rem",
							borderRadius: "4px",
							border: "none",
							backgroundColor: "#3182ce",
							color: "white",
							fontWeight: 500,
							cursor: "pointer",
						}}
					>
						Save Changes
					</button>
				</div>
			</Form>
		</div>
	);
}

// Common styles
const labelStyle = {
	display: "flex",
	flexDirection: "column" as const,
	gap: "0.25rem",
	width: "100%",
};

const labelTextStyle = {
	fontSize: "0.875rem",
	fontWeight: 500 as const,
	color: "#4a5568",
	marginBottom: "0.25rem",
};

const inputStyle = {
	padding: "0.5rem 0.75rem",
	borderRadius: "4px",
	border: "1px solid #cbd5e0",
	width: "100%",
};