/**
 * Matches the ShowcaseResponse DTO from the Spring Boot backend.
 */

export interface ShowcaseResponse {
  creationStatus: 'success' | 'fail';
  projectId: string | null;
}