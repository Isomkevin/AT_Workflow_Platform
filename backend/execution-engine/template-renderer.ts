/**
 * Template Renderer
 * 
 * Renders template strings with variable substitution
 * Supports {{variable.name}} syntax
 */

/**
 * Render a template string with variables
 * 
 * @param template Template string with {{variable}} placeholders
 * @param variables Variables object
 * @returns Rendered string
 */
export function renderTemplate(template: string, variables: Record<string, unknown>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const trimmedPath = path.trim();
    const value = getNestedValue(variables, trimmedPath);
    
    if (value === undefined || value === null) {
      // Return original placeholder if value not found
      return match;
    }
    
    return String(value);
  });
}

/**
 * Get nested value from object using dot notation
 * 
 * @param obj Object to get value from
 * @param path Dot-notation path (e.g., "session.msisdn")
 * @returns Value or undefined
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (typeof current !== 'object') {
      return undefined;
    }

    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Evaluate a simple expression
 * Supports basic comparisons and arithmetic
 * 
 * @param expression Expression string (e.g., "{{amount}} > 100")
 * @param variables Variables object
 * @returns Boolean result
 */
export function evaluateExpression(
  expression: string,
  variables: Record<string, unknown>
): boolean {
  // Replace variables in expression
  const rendered = renderTemplate(expression, variables);
  
  // Simple expression evaluation (for production, use a proper expression parser)
  // This is a simplified version - in production, use a library like expr-eval
  
  try {
    // Basic comparison operators
    if (rendered.includes('>')) {
      const [left, right] = rendered.split('>').map((s) => s.trim());
      return Number(left) > Number(right);
    }
    if (rendered.includes('<')) {
      const [left, right] = rendered.split('<').map((s) => s.trim());
      return Number(left) < Number(right);
    }
    if (rendered.includes('>=')) {
      const [left, right] = rendered.split('>=').map((s) => s.trim());
      return Number(left) >= Number(right);
    }
    if (rendered.includes('<=')) {
      const [left, right] = rendered.split('<=').map((s) => s.trim());
      return Number(left) <= Number(right);
    }
    if (rendered.includes('==')) {
      const [left, right] = rendered.split('==').map((s) => s.trim());
      return String(left) === String(right);
    }
    if (rendered.includes('!=')) {
      const [left, right] = rendered.split('!=').map((s) => s.trim());
      return String(left) !== String(right);
    }
    
    // Default: evaluate as boolean
    return Boolean(rendered);
  } catch {
    return false;
  }
}
