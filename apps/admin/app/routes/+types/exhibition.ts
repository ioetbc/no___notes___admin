import type { LoaderFunctionArgs } from "react-router";

export namespace Route {
	export type LoaderArgs = LoaderFunctionArgs & {
		params: {
			exhibitionId: number;
		};
	};

	export type LoaderData = {
		exhibition: {
			id: number;
			name: string;
			description?: string;
			start_date?: string;
			end_date?: string;
			private_view_start_date?: string;
			private_view_end_date?: string;
			created_at: string;
			updated_at: string;
			gallery_id?: number;
			url?: string;
			recommended?: boolean;
			images: {
				id: number;
				exhibition_id: number;
				image_url: string;
				caption?: string;
				created_at: string;
			}[];
			featured_artists: {
				artist: {
					id: number;
					name: string;
					instagram_handle?: string;
					created_at: string;
				};
			}[];
		};
	};

	export type ComponentProps = {
		loaderData: LoaderData;
	};
}
