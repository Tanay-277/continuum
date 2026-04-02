import { useState } from "react";
import { Label } from "../ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export default function Toolbar() {
	const [cat, setCat] = useState<string | null>("Yearly");

	return (
		<div className="flex toolbar rounded-2xl w-full bg-accent-foreground/5 p-2 px-8 mb-4 font-mono justify-between items-center">
			<p>Board Options</p>
			<div className="options flex gap-2">
				<div id="cat" className="flex gap-2">
					<Label>Categorize by:</Label>
					<Select value={cat} onValueChange={(val) => setCat(val)}>
						<SelectTrigger className="w-45 rounded-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Categories</SelectLabel>
								<SelectItem value="Tier List">Tier List</SelectItem>
								<SelectItem value="Monthly">Monthly</SelectItem>
								<SelectItem value="Yearly">Yearly</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	);
}
