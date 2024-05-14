import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

/**
 * Component that should be used for routes/pages that do not exist
 * @returns JSX Element
 */
export default function PageNotFound() {
    return <div className="m-4"><h2>Page Not Found</h2><p>Invalid URL</p></div>;
}