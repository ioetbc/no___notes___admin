import { format } from "date-fns";
import { useCallback, useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { Form, redirect, useFetcher, useNavigate } from "react-router";
import {
	createImage,
	deleteImage,
	getExhibition,
	updateExhibition,
} from "../data";
import type { Route } from "./+types/exhibition";

export async function action({ params, request }: Route.ActionArgs) {
	const formData = await request.formData();
	const intent = formData.get("intent");

	const exhibitionId = Number(params.thing);
	if (Number.isNaN(exhibitionId)) {
		throw new Response("Invalid exhibition ID", { status: 400 });
	}

	if (intent === "deleteImage") {
		const imageId = formData.get("imageId");
		if (imageId && typeof imageId === "string") {
			await deleteImage(Number(imageId));
			return { success: true };
		}
		return { success: false };
	}

	if (intent === "acceptImage") {
		// Placeholder for future implementation
		return { success: true };
	}

	if (intent === "addImage") {
		const imageUrl = formData.get("imageUrl");
		const caption = formData.get("caption") || "";

		if (imageUrl && typeof imageUrl === "string") {
			await createImage({
				exhibition_id: exhibitionId,
				image_url: imageUrl,
				caption: caption.toString(),
			});
			return { success: true };
		}
		return { success: false };
	}

	const updates = Object.fromEntries(formData);

	if (
		updates.private_view_start_date &&
		typeof updates.private_view_start_date === "string"
	) {
		updates.private_view_start_date = new Date(
			updates.private_view_start_date,
		).toISOString();
	}

	if (
		updates.private_view_end_date &&
		typeof updates.private_view_end_date === "string"
	) {
		updates.private_view_end_date = new Date(
			updates.private_view_end_date,
		).toISOString();
	}

	await updateExhibition(exhibitionId, updates);
	return redirect(`/exhibitions/${exhibitionId}`);
}

export async function loader({ params }: Route.LoaderArgs) {
	const exhibition = await getExhibition(Number(params.exhibitionId));
	if (!exhibition) {
		throw new Response("Not Found", { status: 404 });
	}
	return { exhibition };
}

function ImageEditor({
	image,
}: {
	image: Route.ComponentProps["loaderData"]["exhibition"]["images"][0];
}) {
	const fetcher = useFetcher();

	const handleRemove = () => {
		if (confirm("Are you sure you want to delete this image?")) {
			fetcher.submit(
				{
					intent: "deleteImage",
					imageId: image.id.toString(),
				},
				{ method: "post" },
			);
		}
	};

	return (
		<div
			style={{
				marginBottom: "1.5rem",
				borderRadius: "8px",
				overflow: "hidden",
				border: "1px solid #e2e8f0",
			}}
		>
			<img
				src={image.image_url}
				alt={image.caption || "Exhibition image"}
				style={{
					width: "100%",
					height: "auto",
					display: "block",
				}}
			/>

			<div
				style={{
					padding: "0.75rem",
					display: "flex",
					flexDirection: "column",
					gap: "0.5rem",
				}}
			>
				{image.caption && (
					<div
						style={{
							backgroundColor: "#f7fafc",
							textAlign: "center",
						}}
					>
						<p style={{ margin: 0, color: "#4a5568", fontSize: "0.875rem" }}>
							{image.caption}
						</p>
					</div>
				)}
				<button
					type="button"
					onClick={handleRemove}
					style={{
						width: "100%",
						padding: "0.5rem 1rem",
						borderRadius: "4px",
						border: "1px solid #e53e3e",
						backgroundColor: "white",
						color: "#e53e3e",
						fontWeight: 500,
						cursor: "pointer",
					}}
				>
					Remove
				</button>
			</div>
		</div>
	);
}

function ImageDropzone({ exhibitionId }: { exhibitionId: number }) {
	const [imageUrl, setImageUrl] = useState("");
	const [caption, setCaption] = useState("");
	const fetcher = useFetcher();

	const onDrop = useCallback((acceptedFiles: File[]) => {
		if (acceptedFiles.length === 0) return;

		const file = acceptedFiles[0];

		// In a real application, you would upload the file to a server and get a URL back
		// For this example, we'll use a FileReader to create a data URL
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result === "string") {
				setImageUrl(reader.result);
			}
		};
		reader.readAsDataURL(file);
	}, []);

	const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
		console.log("File rejected:", fileRejections);
		alert("File rejected. Please try a different image file.");
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!imageUrl) {
			alert("Please select an image first");
			return;
		}

		fetcher.submit(
			{
				intent: "addImage",
				imageUrl,
				caption,
			},
			{ method: "post" },
		);

		// Reset form after submission
		setImageUrl("");
		setCaption("");
	};

	// Using react-dropzone for a better file upload experience
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		onDropRejected,
		accept: {
			"image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
		},
		maxSize: 5242880, // 5MB
		maxFiles: 1,
	});

	return (
		<div>
			<h3
				style={{
					fontSize: "1rem",
					fontWeight: 500,
					marginTop: 0,
					marginBottom: "1rem",
				}}
			>
				Add New Image
			</h3>

			<div
				{...getRootProps()}
				style={{
					cursor: "pointer",
					padding: "2rem",
					textAlign: "center",
					borderRadius: "4px",
					border: `1px dashed ${isDragActive ? "#3182ce" : "#cbd5e0"}`,
					backgroundColor: "white",
					marginBottom: "1rem",
					outline: "none",
					transition: "border-color 0.2s ease",
					...(isDragActive ? { backgroundColor: "#ebf8ff" } : {}),
				}}
			>
				<input {...getInputProps()} />
				{imageUrl ? (
					<img
						src={imageUrl}
						alt="Preview"
						style={{
							maxWidth: "100%",
							maxHeight: "200px",
						}}
					/>
				) : (
					<div>
						<p>
							{isDragActive
								? "Drop the image here"
								: "Drag & drop an image here, or click to select"}
						</p>
						<p style={{ fontSize: "0.875rem", color: "#718096" }}>
							Supports: JPG, PNG, GIF (max 5MB)
						</p>
					</div>
				)}
			</div>

			{imageUrl && (
				<>
					<div style={{ marginBottom: "1rem" }}>
						<label style={labelStyle}>
							<span style={labelTextStyle}>Caption (optional)</span>
							<input
								type="text"
								value={caption}
								onChange={(e) => setCaption(e.target.value)}
								placeholder="Add a caption for this image"
								style={inputStyle}
							/>
						</label>
					</div>

					<button
						type="button"
						onClick={handleSubmit}
						style={{
							padding: "0.5rem 1rem",
							borderRadius: "4px",
							border: "none",
							backgroundColor: "#3182ce",
							color: "white",
							fontWeight: 500,
							cursor: "pointer",
						}}
					>
						Upload Image
					</button>
				</>
			)}
		</div>
	);
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
		return format(date, "HH:mm");
	};

	const combineDateTime = (dateValue: string, timeValue: string) => {
		if (!dateValue) return "";
		const time = timeValue || "00:00";
		return `${dateValue}T${time}`;
	};

	return (
		<div style={{ margin: "0 auto", padding: "2rem 1rem" }}>
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
					display: "grid",
					gridTemplateColumns: "1fr 4fr",
					gap: "1.5rem",
					backgroundColor: "#f7fafc",
					padding: "2rem",
					borderRadius: "8px",
					border: "1px solid #e2e8f0",
				}}
			>
				<div>
					<div style={labelStyle}>
						<span style={labelTextStyle}>Exhibition images</span>
						<div
							style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
						>
							{exhibition.images.map((image) => (
								<ImageEditor key={image.id} image={image} />
							))}

							<ImageDropzone exhibitionId={exhibition.id} />
						</div>
					</div>
				</div>
				<div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
										defaultValue={formatDateForInput(
											exhibition.private_view_start_date,
										)}
										id="private_view_start_date"
										type="date"
										style={inputStyle}
										onChange={(e) => {
											const dateValue = e.target.value;
											const timeValue = (
												document.getElementById(
													"private_view_start_time",
												) as HTMLInputElement
											).value;
											(
												document.getElementById(
													"private_view_start_date_hidden",
												) as HTMLInputElement
											).value = combineDateTime(dateValue, timeValue);
										}}
									/>
								</label>
								<label style={{ ...labelStyle, marginTop: "0.5rem" }}>
									<span style={labelTextStyle}>Start Time</span>
									<input
										aria-label="Private view start time"
										defaultValue={formatTimeForInput(
											exhibition.private_view_start_date,
										)}
										id="private_view_start_time"
										type="time"
										style={inputStyle}
										onChange={(e) => {
											const timeValue = e.target.value;
											const dateValue = (
												document.getElementById(
													"private_view_start_date",
												) as HTMLInputElement
											).value;
											(
												document.getElementById(
													"private_view_start_date_hidden",
												) as HTMLInputElement
											).value = combineDateTime(dateValue, timeValue);
										}}
									/>
								</label>
								<input
									type="hidden"
									name="private_view_start_date"
									id="private_view_start_date_hidden"
									defaultValue={
										exhibition.private_view_start_date
											? new Date(
													exhibition.private_view_start_date,
												).toISOString()
											: ""
									}
								/>
							</div>
							<div style={{ flex: 1 }}>
								<label style={labelStyle}>
									<span style={labelTextStyle}>End Date</span>
									<input
										aria-label="Private view end date"
										defaultValue={formatDateForInput(
											exhibition.private_view_end_date,
										)}
										id="private_view_end_date"
										type="date"
										style={inputStyle}
										onChange={(e) => {
											const dateValue = e.target.value;
											const timeValue = (
												document.getElementById(
													"private_view_end_time",
												) as HTMLInputElement
											).value;
											(
												document.getElementById(
													"private_view_end_date_hidden",
												) as HTMLInputElement
											).value = combineDateTime(dateValue, timeValue);
										}}
									/>
								</label>
								<label style={{ ...labelStyle, marginTop: "0.5rem" }}>
									<span style={labelTextStyle}>End Time</span>
									<input
										aria-label="Private view end time"
										defaultValue={formatTimeForInput(
											exhibition.private_view_end_date,
										)}
										id="private_view_end_time"
										type="time"
										style={inputStyle}
										onChange={(e) => {
											const timeValue = e.target.value;
											const dateValue = (
												document.getElementById(
													"private_view_end_date",
												) as HTMLInputElement
											).value;
											(
												document.getElementById(
													"private_view_end_date_hidden",
												) as HTMLInputElement
											).value = combineDateTime(dateValue, timeValue);
										}}
									/>
								</label>
								<input
									type="hidden"
									name="private_view_end_date"
									id="private_view_end_date_hidden"
									defaultValue={
										exhibition.private_view_end_date
											? new Date(exhibition.private_view_end_date).toISOString()
											: ""
									}
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
