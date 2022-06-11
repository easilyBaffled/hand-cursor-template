import { ErrorBoundary as EB } from 'react-error-boundary';
import { ObjectInspector, TableInspector } from 'react-inspector';

function ErrorFallback({ error, context }) {
  return (
    <div className="error-boundary" role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <ObjectInspector data={context} />
    </div>
  );
}

export const ErrorBoundary = ({ children, ...context }) => {
  return (
    <EB
      fallbackRender={({ error }) => (
        <ErrorFallback error={error} context={context} />
      )}
    >
      {children}
    </EB>
  );
};
