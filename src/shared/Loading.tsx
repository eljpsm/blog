import { Spinner } from "react-bootstrap";
import "./Loading.scss";
import React from "react";

/**
 * A basic loading element.
 * @constructor
 */
export const Loading = (): JSX.Element => {
  return <Spinner className={"loading"} animation={"border"} />;
};

export default Loading;
