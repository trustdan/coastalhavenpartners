import 'package:supabase_flutter/supabase_flutter.dart';

/// Shared query builder for firms.
/// This is the SINGLE SOURCE OF TRUTH for firm filtering logic.
/// Used by both getFirmsDirectory() and getFirmsCount() in job_repository.dart.

/// Apply firm filters to a Supabase query.
///
/// This ensures filter logic is consistent between list queries and count queries.
/// Any new filter added here will automatically apply to both.
PostgrestFilterBuilder<List<Map<String, dynamic>>> applyFirmFilters(
  PostgrestFilterBuilder<List<Map<String, dynamic>>> query, {
  String? category,
  String? region,
  String? state,
  int? priority,
  String? searchQuery,
}) {
  if (category != null && category.isNotEmpty) {
    query = query.eq('firm_type', category);
  }
  if (region != null && region.isNotEmpty) {
    query = query.eq('region', region);
  }
  if (state != null && state.isNotEmpty) {
    query = query.eq('state', state);
  }
  if (priority != null) {
    query = query.eq('priority', priority);
  }
  if (searchQuery != null && searchQuery.isNotEmpty) {
    query = query.or(
      'name.ilike.%$searchQuery%,description.ilike.%$searchQuery%,focus_sector.ilike.%$searchQuery%',
    );
  }
  return query;
}

/// Build a complete firms query with filters, sorting, and optional pagination.
///
/// Returns a query ready to be awaited. For pagination, use the returned query
/// with .range(offset, offset + limit - 1).
PostgrestFilterBuilder<List<Map<String, dynamic>>> buildFirmsQuery(
  SupabaseClient supabase, {
  String? category,
  String? region,
  String? state,
  int? priority,
  String? searchQuery,
}) {
  var query = supabase.from('firms').select().eq('is_visible', true);

  return applyFirmFilters(
    query,
    category: category,
    region: region,
    state: state,
    priority: priority,
    searchQuery: searchQuery,
  );
}
