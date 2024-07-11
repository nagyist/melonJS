import React, { type ReactElement } from "react";
import ReactDOM from "react-dom/client";
import { Link, RouterProvider, createBrowserRouter } from "react-router-dom";
import { ExampleAseprite } from "./examples/aseprite/ExampleAseprite";
import { ExampleCollisionTest } from "./examples/collisionTest/ExampleCollisionTest";
import "./index.css";
import { ExampleDeviceTest } from "./examples/deviceTest/ExampleDeviceTest";
import { ExampleDragAndDrop } from "./examples/dragAndDrop/ExampleDragAndDrop";
import { ExampleGraphics } from "./examples/graphics/ExampleGraphics";
import { ExampleHelloWorld } from "./examples/helloWorld/ExampleHelloWorld";
import { ExampleIsometricRPG } from "./examples/isometricRpg/ExampleIsometricRPG";
import { ExampleLights } from "./examples/lights/ExampleLights";
import { ExamplePlatformer } from "./examples/platformer/ExamplePlatformer";
import { ExampleText } from "./examples/text/ExampleText";

const examples: { label: string; path: string; component: ReactElement }[] = [
	{
		component: <ExampleAseprite />,
		label: "aseprite",
		path: "aseprite",
	},
	{
		component: <ExampleCollisionTest />,
		label: "collision test",
		path: "collision-test",
	},
	{
		component: <ExampleDeviceTest />,
		label: "device test",
		path: "device-test",
	},
	{
		component: <ExampleDragAndDrop />,
		label: "drag and drop",
		path: "drag-and-drop",
	},
	{
		component: <ExampleGraphics />,
		label: "graphics",
		path: "graphics",
	},
	{
		component: <ExampleHelloWorld />,
		label: "hello world",
		path: "hello-world",
	},
	{
		component: <ExampleIsometricRPG />,
		label: "isometric rpg",
		path: "isometric-rpg",
	},
	{
		component: <ExampleLights />,
		label: "lights",
		path: "lights",
	},
	{
		component: <ExamplePlatformer />,
		label: "platformer",
		path: "platformer",
	},
	{
		component: <ExampleText />,
		label: "text",
		path: "text",
	},
];

const Index = () => {
	return (
		<>
			<ul>
				{examples.map((example) => {
					return (
						<li key={example.path}>
							<Link to={example.path} reloadDocument>
								{example.label}
							</Link>
						</li>
					);
				})}
			</ul>
		</>
	);
};

const router = createBrowserRouter([
	{
		path: "/",
		element: <Index />,
	},
	...examples.map((example) => {
		return {
			path: example.path,
			element: example.component,
		};
	}),
]);

const rootEl = document.getElementById("root");
if (!rootEl) {
	throw new Error("Root element not found");
}

ReactDOM.createRoot(rootEl).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>,
);
