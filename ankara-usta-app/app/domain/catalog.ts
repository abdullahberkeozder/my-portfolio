import { Service, ServiceCategory } from './models';
import { serviceCategorySchema, serviceSchema } from './schemas';

export class CatalogIntegrityError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Service catalog is invalid:\n${issues.join('\n')}`);
    this.name = 'CatalogIntegrityError';
  }
}

function duplicateValues(values: string[]) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

export function validateServiceCatalog(
  categoryInput: unknown,
  serviceInput: unknown,
): { categories: ServiceCategory[]; services: Service[] } {
  const categoryResult = serviceCategorySchema.array().safeParse(categoryInput);
  const serviceResult = serviceSchema.array().safeParse(serviceInput);
  const issues: string[] = [];

  if (!categoryResult.success) issues.push(...categoryResult.error.issues.map((issue) => `Category ${issue.path.join('.')}: ${issue.message}`));
  if (!serviceResult.success) issues.push(...serviceResult.error.issues.map((issue) => `Service ${issue.path.join('.')}: ${issue.message}`));
  if (!categoryResult.success || !serviceResult.success) throw new CatalogIntegrityError(issues);

  const categories = categoryResult.data;
  const services = serviceResult.data;
  const categoryIds = new Set(categories.map((category) => category.id));

  for (const field of ['id', 'slug'] as const) {
    for (const value of duplicateValues(categories.map((category) => category[field]))) {
      issues.push(`Duplicate category ${field}: ${value}`);
    }
    for (const value of duplicateValues(services.map((service) => service[field]))) {
      issues.push(`Duplicate service ${field}: ${value}`);
    }
  }

  for (const service of services) {
    if (!categoryIds.has(service.categoryId)) {
      issues.push(`Service ${service.id} references missing category ${service.categoryId}`);
    }
  }

  for (const rank of duplicateValues(services.flatMap((service) => service.popularRank ? [String(service.popularRank)] : []))) {
    issues.push(`Duplicate popular rank: ${rank}`);
  }

  if (issues.length) throw new CatalogIntegrityError(issues);
  return {categories, services};
}
