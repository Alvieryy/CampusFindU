import { Link } from "react-router-dom";

export default function EmptyState({
  icon,
  title,
  description,
  actionText,
  actionLink,
  onAction,
  secondaryActionText,
  secondaryActionLink,
  onSecondaryAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm max-w-xl mx-auto my-6">
      <div className="w-16 h-16 rounded-full bg-green-50 text-mmsu-green flex items-center justify-center mb-4 shadow-inner">
        {icon || (
          <svg
            className="w-8 h-8 text-mmsu-green opacity-80"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        )}
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>

      {description && (
        <p className="text-sm text-gray-500 max-w-md mb-6 leading-relaxed">
          {description}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionText &&
          (actionLink ? (
            <Link
              to={actionLink}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-mmsu-green text-white text-sm font-semibold shadow hover:bg-mmsu-light-green transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-mmsu-green"
            >
              {actionText}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-mmsu-green text-white text-sm font-semibold shadow hover:bg-mmsu-light-green transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-mmsu-green"
            >
              {actionText}
            </button>
          ))}

        {secondaryActionText &&
          (secondaryActionLink ? (
            <Link
              to={secondaryActionLink}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold shadow-sm hover:bg-gray-50 transition"
            >
              {secondaryActionText}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold shadow-sm hover:bg-gray-50 transition"
            >
              {secondaryActionText}
            </button>
          ))}
      </div>
    </div>
  );
}
