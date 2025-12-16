import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/utils/app_debug.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/providers/providers.dart';
import '../../../data/models/models.dart';

/// Firms Directory Screen - Browse firms in our network
class FirmsDirectoryScreen extends ConsumerStatefulWidget {
  const FirmsDirectoryScreen({super.key});

  @override
  ConsumerState<FirmsDirectoryScreen> createState() =>
      _FirmsDirectoryScreenState();
}

class _FirmsDirectoryScreenState extends ConsumerState<FirmsDirectoryScreen> {
  final _searchController = TextEditingController();
  final _debouncer = _Debouncer(milliseconds: 500);

  @override
  void dispose() {
    _searchController.dispose();
    _debouncer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final params = ref.watch(firmsDirectoryParamsProvider);
    final firmsPagedAsync = ref.watch(firmsDirectoryPagedProvider);
    final savedFirmIdsAsync = ref.watch(savedFirmsNotifierProvider);

    return Scaffold(
      appBar: AppBar(
        title: GestureDetector(
          onLongPress: () {
            // Long-press title to dump current filter state to logs.
            AppDebug.log(
              'firms',
              'title long-press: current params',
              data: {
                'category': params.category,
                'region': params.region,
                'state': params.state,
                'priority': params.priority,
                'searchQuery': params.searchQuery,
                'sortBy': params.sortBy,
                'ascending': params.ascending,
                'limit': params.limit,
                'offset': params.offset,
              },
            );
          },
          child: const Text('Firms Directory'),
        ),
        actions: [
          if (AppDebug.enabled)
            IconButton(
              icon: const Icon(Icons.bug_report_outlined),
              tooltip: 'Debug: log current state',
              onPressed: () {
                final paged = firmsPagedAsync.asData?.value;
                AppDebug.log(
                  'firms',
                  'debug button pressed',
                  data: {
                    'params.category': params.category,
                    'params.region': params.region,
                    'params.state': params.state,
                    'params.priority': params.priority,
                    'params.searchQuery': params.searchQuery,
                    'params.sortBy': params.sortBy,
                    'params.ascending': params.ascending,
                    'paged.totalCount': paged?.totalCount,
                    'paged.firms.length': paged?.firms.length,
                    'paged.hasMore': paged?.hasMore,
                  },
                );
              },
            ),
          IconButton(
            icon: const Icon(Icons.bookmark_outline),
            tooltip: 'Saved Firms',
            onPressed: () => _showSavedFirms(context),
          ),
          IconButton(
            icon: const Icon(Icons.filter_list),
            tooltip: 'Filters',
            onPressed: () => _showFilters(context, params),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: AppSpacing.screenPaddingHorizontal,
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search firms...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          ref
                              .read(firmsDirectoryParamsProvider.notifier)
                              .setSearchQuery(null);
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
                filled: true,
                fillColor: isDark ? AppColors.cardDark : AppColors.cardLight,
              ),
              onChanged: (value) {
                _debouncer.run(() {
                  AppDebug.log(
                    'firms',
                    'search changed (debounced)',
                    data: {'value': value},
                  );
                  ref
                      .read(firmsDirectoryParamsProvider.notifier)
                      .setSearchQuery(value.isEmpty ? null : value);
                });
              },
            ),
          ),
          AppSpacing.itemGap,

          // Filter Chips
          SizedBox(
            height: 40,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: AppSpacing.screenPaddingHorizontal,
              children: [
                _buildCategoryChip(context, 'All', null, params.category),
                const SizedBox(width: 8),
                _buildCategoryChip(
                  context,
                  'IB',
                  'Investment Banking',
                  params.category,
                ),
                const SizedBox(width: 8),
                _buildCategoryChip(
                  context,
                  'PE',
                  'Private Equity',
                  params.category,
                ),
                const SizedBox(width: 8),
                _buildCategoryChip(
                  context,
                  'VC',
                  'Venture Capital',
                  params.category,
                ),
                const SizedBox(width: 8),
                _buildCategoryChip(
                  context,
                  'HF',
                  'Hedge Fund',
                  params.category,
                ),
                const SizedBox(width: 8),
                _buildCategoryChip(
                  context,
                  'AM',
                  'Asset Management',
                  params.category,
                ),
                const SizedBox(width: 8),
                _buildCategoryChip(
                  context,
                  'FO',
                  'Family Office',
                  params.category,
                ),
              ],
            ),
          ),
          AppSpacing.subsectionGap,

          // Offline Banner (when showing cached data)
          firmsPagedAsync.whenOrNull(
            data: (paged) => paged.isFromCache
                ? Container(
                    width: double.infinity,
                    margin: AppSpacing.screenPaddingHorizontal,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.warning.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: AppColors.warning.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.cloud_off,
                          size: 16,
                          color: AppColors.warning,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'You\'re offline. Showing cached data.',
                            style: AppTextStyles.caption.copyWith(
                              color: AppColors.warning,
                            ),
                          ),
                        ),
                      ],
                    ),
                  )
                : null,
          ) ?? const SizedBox.shrink(),

          // Spacing after banner (only if banner shown)
          firmsPagedAsync.whenOrNull(
            data: (paged) => paged.isFromCache ? AppSpacing.itemGap : null,
          ) ?? const SizedBox.shrink(),

          // Results Count and Sort
          Padding(
            padding: AppSpacing.screenPaddingHorizontal,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                firmsPagedAsync.when(
                  loading: () => Text(
                    'Loading...',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  error: (_, __) => Text(
                    '0 firms found',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  data: (paged) => Text(
                    '${paged.totalCount} results found',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
                TextButton.icon(
                  onPressed: () => _showSortOptions(context, params),
                  icon: const Icon(Icons.sort, size: 18),
                  label: Text(_getSortLabel(params.sortBy)),
                ),
              ],
            ),
          ),

          // Firms List
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async {
                AppDebug.log('firms', 'pull-to-refresh');
                ref.invalidate(firmsDirectoryPagedProvider);
              },
              child: firmsPagedAsync.when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (error, stack) => Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.error_outline,
                        size: 48,
                        color: Colors.red,
                      ),
                      const SizedBox(height: 16),
                      Text('Error loading firms'),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () =>
                            ref.invalidate(firmsDirectoryPagedProvider),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                ),
                data: (paged) {
                  final firms = paged.firms;
                  if (firms.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.business_outlined,
                            size: 64,
                            color: Theme.of(
                              context,
                            ).colorScheme.onSurfaceVariant,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'No firms found',
                            style: AppTextStyles.h4.copyWith(
                              color: Theme.of(
                                context,
                              ).colorScheme.onSurfaceVariant,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Try adjusting your search or filters',
                            style: AppTextStyles.bodySmall.copyWith(
                              color: Theme.of(
                                context,
                              ).colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    );
                  }

                  final savedIds = savedFirmIdsAsync.value ?? {};

                  return ListView.separated(
                    padding: AppSpacing.screenPadding,
                    itemCount: firms.length + 1,
                    separatorBuilder: (_, __) => AppSpacing.subsectionGap,
                    itemBuilder: (context, index) {
                      // Load more row
                      if (index == firms.length) {
                        if (!paged.hasMore) {
                          return Padding(
                            padding: const EdgeInsets.only(top: 8),
                            child: Center(
                              child: Text(
                                'End of results',
                                style: AppTextStyles.caption.copyWith(
                                  color: Theme.of(
                                    context,
                                  ).colorScheme.onSurfaceVariant,
                                ),
                              ),
                            ),
                          );
                        }
                        return Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Center(
                            child: ElevatedButton(
                              onPressed: paged.isLoadingMore
                                  ? null
                                  : () async {
                                      await ref
                                          .read(
                                            firmsDirectoryPagedProvider
                                                .notifier,
                                          )
                                          .loadMore();
                                    },
                              child: Text(
                                paged.isLoadingMore
                                    ? 'Loading...'
                                    : 'Load More',
                              ),
                            ),
                          ),
                        );
                      }

                      final firm = firms[index];
                      return _buildFirmCard(
                        context,
                        isDark,
                        firm,
                        savedIds.contains(firm.id),
                      );
                    },
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(
    BuildContext context,
    String label,
    String? category,
    String? selectedCategory,
  ) {
    final isSelected = selectedCategory == category;
    return FilterChip(
      label: Text(
        label,
        style: TextStyle(
          color: isSelected
              ? AppColors.teal
              : Theme.of(context).colorScheme.onSurface,
        ),
      ),
      selected: isSelected,
      onSelected: (_) {
        AppDebug.log(
          'firms',
          'category chip tapped',
          data: {
            'label': label,
            'category': category,
            'selectedCategoryBefore': selectedCategory,
          },
        );
        ref.read(firmsDirectoryParamsProvider.notifier).setCategory(category);
      },
      selectedColor: AppColors.teal.withValues(alpha: 0.2),
      checkmarkColor: AppColors.teal,
      backgroundColor: Theme.of(context).colorScheme.surface,
      side: BorderSide(
        color: isSelected
            ? AppColors.teal
            : Theme.of(context).colorScheme.outline,
      ),
    );
  }

  Widget _buildFirmCard(
    BuildContext context,
    bool isDark,
    Firm firm,
    bool isSaved,
  ) {
    return GestureDetector(
      onTap: () => _showFirmDetails(context, firm),
      child: Container(
        padding: AppSpacing.cardPadding,
        decoration: BoxDecoration(
          color: isDark ? AppColors.cardDark : AppColors.cardLight,
          borderRadius: AppRadius.card,
          border: Border.all(
            color: firm.priority == 1
                ? AppColors.warning.withValues(alpha: 0.5)
                : (isDark ? AppColors.borderDark : AppColors.borderLight),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Row
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Firm Logo
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: AppColors.teal.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: firm.logoUrl != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.network(
                            firm.logoUrl!,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Center(
                              child: Text(
                                firm.name.isNotEmpty
                                    ? firm.name.substring(0, 1)
                                    : 'F',
                                style: AppTextStyles.h3.copyWith(
                                  color: AppColors.teal,
                                ),
                              ),
                            ),
                          ),
                        )
                      : Center(
                          child: Text(
                            firm.name.isNotEmpty
                                ? firm.name.substring(0, 1)
                                : 'F',
                            style: AppTextStyles.h3.copyWith(
                              color: AppColors.teal,
                            ),
                          ),
                        ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              firm.name,
                              style: AppTextStyles.labelLarge,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          if (firm.priority != null)
                            Text(
                              firm.priorityStars,
                              style: TextStyle(
                                color: firm.priority == 1
                                    ? AppColors.warning
                                    : firm.priority == 2
                                    ? AppColors.info
                                    : Colors.grey,
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      if (firm.firmType != null)
                        Text(
                          firm.firmType!,
                          style: AppTextStyles.bodySmall.copyWith(
                            color: Theme.of(
                              context,
                            ).colorScheme.onSurfaceVariant,
                          ),
                        ),
                    ],
                  ),
                ),
                IconButton(
                  icon: Icon(
                    isSaved ? Icons.bookmark : Icons.bookmark_border,
                    color: isSaved ? AppColors.teal : null,
                  ),
                  onPressed: () {
                    ref
                        .read(savedFirmsNotifierProvider.notifier)
                        .toggleSave(firm.id, isSaved);
                  },
                ),
              ],
            ),

            if (firm.description != null) ...[
              AppSpacing.itemGap,
              Text(
                firm.description!,
                style: AppTextStyles.bodySmall.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
            AppSpacing.subsectionGap,

            // Tags Row
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                if (firm.locationString != null)
                  _buildTag(
                    context,
                    Icons.location_on_outlined,
                    firm.locationString!,
                  ),
                if (firm.region != null)
                  _buildTag(context, Icons.public, firm.region!),
                if (firm.employeeCount != null)
                  _buildTag(context, Icons.people_outline, firm.employeeCount!),
                if (firm.foundedYear != null)
                  _buildTag(
                    context,
                    Icons.calendar_today,
                    'Est. ${firm.foundedYear}',
                  ),
              ],
            ),

            if (firm.focusSector != null) ...[
              AppSpacing.itemGap,
              Text(
                'Focus: ${firm.focusSector}',
                style: AppTextStyles.caption.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTag(BuildContext context, IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 14,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
          const SizedBox(width: 4),
          Text(
            text,
            style: AppTextStyles.caption.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  String _getSortLabel(String sortBy) {
    switch (sortBy) {
      case 'priority':
        return 'Priority';
      case 'name':
        return 'Name';
      case 'founded_year':
        return 'Founded';
      default:
        return 'Sort';
    }
  }

  void _showSortOptions(BuildContext context, FirmsDirectoryParams params) {
    showModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Padding(
              padding: EdgeInsets.all(16),
              child: Text('Sort By', style: AppTextStyles.h4),
            ),
            ListTile(
              leading: Icon(
                Icons.star,
                color: params.sortBy == 'priority' ? AppColors.teal : null,
              ),
              title: const Text('Priority'),
              trailing: params.sortBy == 'priority'
                  ? const Icon(Icons.check, color: AppColors.teal)
                  : null,
              onTap: () {
                AppDebug.log(
                  'firms',
                  'sort selected',
                  data: {'sortBy': 'priority'},
                );
                ref
                    .read(firmsDirectoryParamsProvider.notifier)
                    .setSortBy('priority', ascending: true);
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: Icon(
                Icons.sort_by_alpha,
                color: params.sortBy == 'name' ? AppColors.teal : null,
              ),
              title: const Text('Name (A-Z)'),
              trailing: params.sortBy == 'name'
                  ? const Icon(Icons.check, color: AppColors.teal)
                  : null,
              onTap: () {
                AppDebug.log(
                  'firms',
                  'sort selected',
                  data: {'sortBy': 'name'},
                );
                ref
                    .read(firmsDirectoryParamsProvider.notifier)
                    .setSortBy('name', ascending: true);
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: Icon(
                Icons.calendar_today,
                color: params.sortBy == 'founded_year' ? AppColors.teal : null,
              ),
              title: const Text('Founded (Newest)'),
              trailing: params.sortBy == 'founded_year'
                  ? const Icon(Icons.check, color: AppColors.teal)
                  : null,
              onTap: () {
                AppDebug.log(
                  'firms',
                  'sort selected',
                  data: {'sortBy': 'founded_year'},
                );
                ref
                    .read(firmsDirectoryParamsProvider.notifier)
                    .setSortBy('founded_year', ascending: false);
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showFilters(BuildContext context, FirmsDirectoryParams params) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        minChildSize: 0.4,
        maxChildSize: 0.9,
        expand: false,
        builder: (context, scrollController) => SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Filters', style: AppTextStyles.h4),
                    TextButton(
                      onPressed: () {
                        ref
                            .read(firmsDirectoryParamsProvider.notifier)
                            .clearFilters();
                        _searchController.clear();
                        Navigator.pop(context);
                      },
                      child: const Text('Clear All'),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  children: [
                    // Region Filter
                    const Text('Region', style: AppTextStyles.labelMedium),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _buildFilterChip('All Regions', null, params.region, (
                          v,
                        ) {
                          ref
                              .read(firmsDirectoryParamsProvider.notifier)
                              .setRegion(v);
                        }),
                        _buildFilterChip('PNW', 'PNW', params.region, (v) {
                          ref
                              .read(firmsDirectoryParamsProvider.notifier)
                              .setRegion(v);
                        }),
                        _buildFilterChip(
                          'Bay Area',
                          'Bay Area',
                          params.region,
                          (v) {
                            ref
                                .read(firmsDirectoryParamsProvider.notifier)
                                .setRegion(v);
                          },
                        ),
                        _buildFilterChip(
                          'Los Angeles',
                          'Los Angeles',
                          params.region,
                          (v) {
                            ref
                                .read(firmsDirectoryParamsProvider.notifier)
                                .setRegion(v);
                          },
                        ),
                        _buildFilterChip('Texas', 'Texas', params.region, (v) {
                          ref
                              .read(firmsDirectoryParamsProvider.notifier)
                              .setRegion(v);
                        }),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Priority Filter
                    const Text('Priority', style: AppTextStyles.labelMedium),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _buildPriorityChip('All', null, params.priority),
                        _buildPriorityChip(
                          'High (\u2605\u2605\u2605)',
                          1,
                          params.priority,
                        ),
                        _buildPriorityChip(
                          'Medium (\u2605\u2605)',
                          2,
                          params.priority,
                        ),
                        _buildPriorityChip(
                          'Lower (\u2605)',
                          3,
                          params.priority,
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // State Filter
                    const Text('State', style: AppTextStyles.labelMedium),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _buildFilterChip('All States', null, params.state, (v) {
                          ref
                              .read(firmsDirectoryParamsProvider.notifier)
                              .setState(v);
                        }),
                        for (final state in [
                          'WA',
                          'OR',
                          'CA',
                          'CO',
                          'TX',
                          'NY',
                        ])
                          _buildFilterChip(state, state, params.state, (v) {
                            ref
                                .read(firmsDirectoryParamsProvider.notifier)
                                .setState(v);
                          }),
                      ],
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Apply Filters'),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFilterChip(
    String label,
    String? value,
    String? selectedValue,
    void Function(String?) onSelected,
  ) {
    final isSelected = selectedValue == value;
    return FilterChip(
      label: Text(
        label,
        style: TextStyle(
          color: isSelected
              ? AppColors.teal
              : Theme.of(context).colorScheme.onSurface,
        ),
      ),
      selected: isSelected,
      onSelected: (_) => onSelected(value),
      selectedColor: AppColors.teal.withValues(alpha: 0.2),
      checkmarkColor: AppColors.teal,
      backgroundColor: Theme.of(context).colorScheme.surface,
      side: BorderSide(
        color: isSelected
            ? AppColors.teal
            : Theme.of(context).colorScheme.outline,
      ),
    );
  }

  Widget _buildPriorityChip(String label, int? value, int? selectedValue) {
    final isSelected = selectedValue == value;
    return FilterChip(
      label: Text(
        label,
        style: TextStyle(
          color: isSelected
              ? AppColors.teal
              : Theme.of(context).colorScheme.onSurface,
        ),
      ),
      selected: isSelected,
      onSelected: (_) {
        ref.read(firmsDirectoryParamsProvider.notifier).setPriority(value);
      },
      selectedColor: AppColors.teal.withValues(alpha: 0.2),
      checkmarkColor: AppColors.teal,
      backgroundColor: Theme.of(context).colorScheme.surface,
      side: BorderSide(
        color: isSelected
            ? AppColors.teal
            : Theme.of(context).colorScheme.outline,
      ),
    );
  }

  void _showFirmDetails(BuildContext context, Firm firm) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) =>
            _FirmDetailsSheet(firm: firm, scrollController: scrollController),
      ),
    );
  }

  void _showSavedFirms(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) => Consumer(
          builder: (context, ref, _) {
            final savedFirmsAsync = ref.watch(savedFirmsProvider);
            return SafeArea(
              child: Column(
                children: [
                  const Padding(
                    padding: EdgeInsets.all(16),
                    child: Text('Saved Firms', style: AppTextStyles.h4),
                  ),
                  Expanded(
                    child: savedFirmsAsync.when(
                      loading: () =>
                          const Center(child: CircularProgressIndicator()),
                      error: (_, __) => const Center(
                        child: Text('Error loading saved firms'),
                      ),
                      data: (firms) {
                        if (firms.isEmpty) {
                          return Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.bookmark_outline,
                                  size: 64,
                                  color: Theme.of(
                                    context,
                                  ).colorScheme.onSurfaceVariant,
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'No saved firms',
                                  style: AppTextStyles.bodyMedium.copyWith(
                                    color: Theme.of(
                                      context,
                                    ).colorScheme.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ),
                          );
                        }
                        return ListView.separated(
                          controller: scrollController,
                          padding: const EdgeInsets.all(16),
                          itemCount: firms.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final firm = firms[index];
                            return ListTile(
                              leading: CircleAvatar(
                                backgroundColor: AppColors.teal.withValues(
                                  alpha: 0.1,
                                ),
                                child: Text(
                                  firm.name.isNotEmpty
                                      ? firm.name.substring(0, 1)
                                      : 'F',
                                  style: const TextStyle(color: AppColors.teal),
                                ),
                              ),
                              title: Text(firm.name),
                              subtitle: Text(firm.firmType ?? ''),
                              trailing: IconButton(
                                icon: const Icon(
                                  Icons.bookmark,
                                  color: AppColors.teal,
                                ),
                                onPressed: () {
                                  ref
                                      .read(savedFirmsNotifierProvider.notifier)
                                      .unsaveFirm(firm.id);
                                  ref.invalidate(savedFirmsProvider);
                                },
                              ),
                              onTap: () {
                                Navigator.pop(context);
                                _showFirmDetails(context, firm);
                              },
                            );
                          },
                        );
                      },
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

/// Firm Details Bottom Sheet
class _FirmDetailsSheet extends ConsumerWidget {
  final Firm firm;
  final ScrollController scrollController;

  const _FirmDetailsSheet({required this.firm, required this.scrollController});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final savedIdsAsync = ref.watch(savedFirmsNotifierProvider);
    final isSaved = savedIdsAsync.value?.contains(firm.id) ?? false;

    return SafeArea(
      child: Column(
        children: [
          // Handle
          Container(
            margin: const EdgeInsets.only(top: 8),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Expanded(
            child: ListView(
              controller: scrollController,
              padding: const EdgeInsets.all(16),
              children: [
                // Header
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        color: AppColors.teal.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Center(
                        child: Text(
                          firm.name.isNotEmpty
                              ? firm.name.substring(0, 1)
                              : 'F',
                          style: AppTextStyles.h2.copyWith(
                            color: AppColors.teal,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(firm.name, style: AppTextStyles.h3),
                          if (firm.firmType != null) ...[
                            const SizedBox(height: 4),
                            Text(
                              firm.firmType!,
                              style: AppTextStyles.bodyMedium.copyWith(
                                color: Theme.of(
                                  context,
                                ).colorScheme.onSurfaceVariant,
                              ),
                            ),
                          ],
                          if (firm.priority != null) ...[
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Text(
                                  firm.priorityStars,
                                  style: TextStyle(
                                    color: firm.priority == 1
                                        ? AppColors.warning
                                        : firm.priority == 2
                                        ? AppColors.info
                                        : Colors.grey,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  firm.priorityLabel,
                                  style: AppTextStyles.caption,
                                ),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),
                    IconButton(
                      icon: Icon(
                        isSaved ? Icons.bookmark : Icons.bookmark_border,
                        color: isSaved ? AppColors.teal : null,
                      ),
                      onPressed: () {
                        ref
                            .read(savedFirmsNotifierProvider.notifier)
                            .toggleSave(firm.id, isSaved);
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Description
                if (firm.description != null) ...[
                  Text('About', style: AppTextStyles.labelLarge),
                  const SizedBox(height: 8),
                  Text(firm.description!, style: AppTextStyles.bodyMedium),
                  const SizedBox(height: 24),
                ],

                // Details
                _buildDetailRow(
                  context,
                  Icons.location_on,
                  'Location',
                  firm.locationString,
                ),
                _buildDetailRow(context, Icons.public, 'Region', firm.region),
                _buildDetailRow(
                  context,
                  Icons.business,
                  'Focus',
                  firm.focusSector,
                ),
                _buildDetailRow(
                  context,
                  Icons.account_balance,
                  'AUM/Fund Size',
                  firm.aumFundSize,
                ),
                _buildDetailRow(
                  context,
                  Icons.attach_money,
                  'Deal Size',
                  firm.dealSizeCriteria,
                ),
                _buildDetailRow(
                  context,
                  Icons.people,
                  'Team Size',
                  firm.employeeCount,
                ),
                _buildDetailRow(
                  context,
                  Icons.calendar_today,
                  'Founded',
                  firm.foundedYear?.toString(),
                ),
                _buildDetailRow(
                  context,
                  Icons.school,
                  'UW Foster Relevance',
                  firm.uwFosterRelevance,
                ),

                if (firm.notes != null && firm.notes!.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Text('Notes', style: AppTextStyles.labelLarge),
                  const SizedBox(height: 8),
                  Text(firm.notes!, style: AppTextStyles.bodySmall),
                ],

                const SizedBox(height: 24),

                // Actions
                if (firm.website != null)
                  ElevatedButton.icon(
                    onPressed: () => _launchUrl(firm.website!),
                    icon: const Icon(Icons.open_in_new),
                    label: const Text('Visit Website'),
                  ),
                if (firm.contactEmail != null) ...[
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: () => _launchUrl('mailto:${firm.contactEmail}'),
                    icon: const Icon(Icons.email),
                    label: const Text('Contact'),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(
    BuildContext context,
    IconData icon,
    String label,
    String? value,
  ) {
    if (value == null || value.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            icon,
            size: 20,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: AppTextStyles.caption),
                Text(value, style: AppTextStyles.bodyMedium),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _launchUrl(String url) async {
    final uri = url.startsWith('http')
        ? Uri.parse(url)
        : Uri.parse('https://$url');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }
}

/// Debouncer utility for search input
class _Debouncer {
  final int milliseconds;
  _Debouncer({required this.milliseconds});

  Timer? _timer;

  void run(VoidCallback action) {
    _timer?.cancel();
    _timer = Timer(Duration(milliseconds: milliseconds), action);
  }

  void dispose() {
    _timer?.cancel();
  }
}
