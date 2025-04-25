import { redirect } from "react-router";
import { deleteExhibition } from "../data";
import type { Route } from "./+types/destroy-exhibition";

export async function action({ params }: Route.ActionArgs) {
	await deleteExhibition(Number(params.exhibition_id));
	return redirect("/");
}
