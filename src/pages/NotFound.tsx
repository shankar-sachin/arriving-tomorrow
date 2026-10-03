import { Link } from "react-router-dom";
import { Page } from "../components/Page";

export function NotFound() {
  return (
    <Page className="center">
      <h1>404: page never came.</h1>
      <p className="lede">Consistent, at least.</p>
      <Link to="/" className="btn btn-primary">Take me home</Link>
    </Page>
  );
}
