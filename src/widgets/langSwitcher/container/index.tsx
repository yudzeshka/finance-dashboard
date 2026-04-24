import { UI } from "../ui";
import { useContainer } from "./useContainer";
import type { FC } from "react";

export const Container: FC = () => <UI {...useContainer()} />;
