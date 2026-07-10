/**
 * The seam between packages/core (which produces errors, e.g. PermissionError)
 * and packages/tui (which renders them via ErrorDisplay), so neither package
 * needs to depend on the other.
 */
export interface ActionableError {
  title: string;
  message: string;
  nextStep: string;
}
