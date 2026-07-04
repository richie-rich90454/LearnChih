import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  makeStyles,
  tokens,
  Title2,
  Subtitle2,
  Card,
  Badge,
  Button,
  Dropdown,
  Option,
  Input,
  Label,
  Textarea,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Spinner,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Select,
  Field,
} from '@fluentui/react-components'
import { Add24Regular, ArrowUpload24Regular, Link24Regular, Bookmark24Regular, Bookmark24Filled } from '@fluentui/react-icons'
import { useResources, useCreateResource } from '@/hooks/useResources'
import { useDebounce } from '@/hooks/useDebounce'
import { useTranslation } from 'react-i18next'
import type { Resource } from '@/types'
import Seo from '@/components/Seo'
import { Pagination } from '@/components/Pagination'
import { TagList } from '@/components/TagBadge'
import { StaggerReveal } from '@/components/StaggerReveal'
import { HoverLift } from '@/components/HoverLift'
import { useBookmarkStore } from '@/store/bookmarkStore'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    maxWidth: '1100px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalM,
  },
  filterBar: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: tokens.spacingHorizontalM,
  },
  resourceCard: {
    cursor: 'pointer',
    padding: tokens.spacingHorizontalL,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: tokens.spacingVerticalXS,
  },
  cardMeta: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    alignItems: 'center',
    marginTop: tokens.spacingVerticalXS,
  },
  dialogForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
})

const CATEGORIES = ['NOTES', 'PAST_PAPER', 'TEXTBOOK', 'TUTORIAL', 'OTHER']
const SUBJECTS = ['Mathematics', 'Physics', 'Computer Science', 'Chemistry', 'Biology', 'Economics', 'English', 'History', 'Other']

export default function ResourcesPage() {
  const { t } = useTranslation()
  const styles = useStyles()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const hasQueryParams = searchParams.has('q') || searchParams.has('page')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [subjectFilter, setSubjectFilter] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  // Upload form state
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [category, setCategory] = useState<string>('NOTES')
  const [resourceType, setResourceType] = useState<string>('UPLOAD')
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState<string>('')
  const [subject, setSubject] = useState<string>('')
  const [topic, setTopic] = useState<string>('')
  const [course, setCourse] = useState<string>('')

  const params: Record<string, string> = {}
  if (categoryFilter) params.category = categoryFilter
  if (subjectFilter) params.subject = subjectFilter

  const { data, isLoading, isError } = useResources(params)
  const createMutation = useCreateResource()

  const resources: Resource[] = Array.isArray(data) ? data : (data as any)?.content || []
  const { toggleBookmark, isBookmarked } = useBookmarkStore()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'upvoted'>('newest')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const debouncedSearch = useDebounce(searchQuery, 250)
  const PAGE_SIZE = 9

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      if (!debouncedSearch) return true
      const q = debouncedSearch.toLowerCase()
      return (
        r.title?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.authorName?.toLowerCase().includes(q)
      )
    })
  }, [resources, debouncedSearch])

  const sortedResources = useMemo(() => {
    const arr = [...filteredResources]
    if (sortBy === 'newest') {
      arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sortBy === 'oldest') {
      arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    } else {
      arr.sort((a, b) => (b.upvoteCount ?? 0) - (a.upvoteCount ?? 0))
    }
    return arr
  }, [filteredResources, sortBy])

  const totalPages = Math.ceil(sortedResources.length / PAGE_SIZE)
  const paginatedResources = sortedResources.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const prevPath = currentPage > 1 && totalPages > 1 ? `/resources?page=${currentPage - 1}` : undefined
  const nextPath = currentPage < totalPages && totalPages > 1 ? `/resources?page=${currentPage + 1}` : undefined

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, sortBy, categoryFilter, subjectFilter])

  const handleCreate = () => {
    const formData: Record<string, unknown> = {
      title,
      description,
      category,
      type: resourceType,
      subject,
      topic,
      course,
    }
    if (resourceType === 'UPLOAD' && file) {
      formData.file = file
    } else if (resourceType === 'LINK') {
      formData.url = url
    }

    createMutation.mutate(formData, {
      onSuccess: () => {
        setDialogOpen(false)
        resetForm()
      },
    })
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCategory('NOTES')
    setResourceType('UPLOAD')
    setFile(null)
    setUrl('')
    setSubject('')
    setTopic('')
    setCourse('')
  }

  return (
    <div className={styles.container}>
      <Seo
        title={`${t('resources.title')} — LernChih`}
        description={t('resources.description')}
        canonicalPath="/resources"
        prevPath={prevPath}
        nextPath={nextPath}
        robots={hasQueryParams ? 'noindex, follow' : 'index, follow'}
        hreflang
      />
      <div className={styles.headerRow}>
        <Title2 as="h1">{t('resources.title')}</Title2>
        <Dialog open={dialogOpen} onOpenChange={(_: unknown, d: { open: boolean }) => setDialogOpen(d.open)}>
          <DialogTrigger disableButtonEnhancement>
            <Button appearance="primary" icon={<Add24Regular />}>{t('resources.uploadResource')}</Button>
          </DialogTrigger>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>{t('resources.uploadResource')}</DialogTitle>
              <DialogContent>
                {createMutation.isError && (
                  <MessageBar intent="error">
                    <MessageBarBody>
                      {(createMutation.error as any)?.response?.data?.message || t('resources.loadError')}
                    </MessageBarBody>
                  </MessageBar>
                )}
                <div className={styles.dialogForm}>
                  <Field label={t('resources.titleLabel')} required>
                    <Input value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} placeholder={t('resources.titleLabel')} />
                  </Field>
                  <Field label={t('resources.descriptionLabel')}>
                    <Textarea value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} placeholder={t('resources.descriptionLabel')} />
                  </Field>
                  <Field label={t('resources.category')}>
                    <Select value={category} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c.replace('_', ' ')}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label={t('resources.type')}>
                    <Select value={resourceType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setResourceType(e.target.value)}>
                      <option value="UPLOAD">{t('resources.file')}</option>
                      <option value="LINK">{t('resources.url')}</option>
                    </Select>
                  </Field>
                  {resourceType === 'UPLOAD' ? (
                    <Field label={t('resources.file')}>
                      <input
                        type="file"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] ?? null)}
                        style={{ marginTop: '4px' }}
                      />
                    </Field>
                  ) : (
                    <Field label={t('resources.url')}>
                      <Input value={url} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)} placeholder="https://..." />
                    </Field>
                  )}
                  <Field label={t('resources.subject')}>
                    <Select value={subject} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSubject(e.target.value)}>
                      <option value="">{t('common.select') || 'Select subject'}</option>
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label={t('resources.topic')}>
                    <Input value={topic} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTopic(e.target.value)} placeholder="e.g. Calculus" />
                  </Field>
                  <Field label={t('resources.course')}>
                    <Input value={course} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCourse(e.target.value)} placeholder="e.g. MATH101" />
                  </Field>
                </div>
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
                <Button
                  appearance="primary"
                  onClick={handleCreate}
                  disabled={createMutation.isPending || !title}
                >
                  {createMutation.isPending ? <Spinner size="tiny" /> : t('common.upload')}
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </div>

      {/* Filter bar */}
      <div className={styles.filterBar}>
        <Input
          placeholder={t('resources.searchPlaceholder')}
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          style={{ minWidth: '200px' }}
          aria-label={t('resources.searchPlaceholder')}
        />
        <Dropdown
          placeholder={t('resources.category')}
          value={categoryFilter || undefined}
          selectedOptions={categoryFilter ? [categoryFilter] : []}
          onOptionSelect={(_: unknown, data: { optionValue?: string }) => setCategoryFilter(data.optionValue || '')}
          clearable
        >
          {CATEGORIES.map((c) => (
            <Option key={c} value={c}>{c.replace('_', ' ')}</Option>
          ))}
        </Dropdown>
        <Dropdown
          placeholder={t('resources.subject')}
          value={subjectFilter || undefined}
          selectedOptions={subjectFilter ? [subjectFilter] : []}
          onOptionSelect={(_: unknown, data: { optionValue?: string }) => setSubjectFilter(data.optionValue || '')}
          clearable
        >
          {SUBJECTS.map((s) => (
            <Option key={s} value={s}>{s}</Option>
          ))}
        </Dropdown>
        <Dropdown
          placeholder={t('common.sortBy')}
          value={sortBy === 'newest' ? t('resources.newest') : sortBy === 'oldest' ? t('resources.oldest') : t('resources.mostUpvoted')}
          selectedOptions={[sortBy]}
          onOptionSelect={(_: unknown, data: { optionValue?: string }) => data.optionValue && setSortBy(data.optionValue as 'newest' | 'oldest' | 'upvoted')}
        >
          <Option value="newest">{t('resources.newest')}</Option>
          <Option value="oldest">{t('resources.oldest')}</Option>
          <Option value="upvoted">{t('resources.mostUpvoted')}</Option>
        </Dropdown>
      </div>

      {/* Resources grid */}
      {isLoading && <Spinner label={t('common.loading')} />}
      {isError && (
        <MessageBar intent="error">
          <MessageBarBody>{t('resources.loadError')}</MessageBarBody>
        </MessageBar>
      )}
      {!isLoading && resources.length === 0 && (
        <MessageBar>
          <MessageBarBody>{t('resources.noResources')}</MessageBarBody>
        </MessageBar>
      )}
      {/* TODO(perf): When resource counts exceed ~100 items, introduce list
          virtualization (e.g. react-window / react-virtual) to avoid
          rendering off-screen DOM nodes. Not added now to keep the change
          dependency-free. Keys are already stable (resource.id). */}
      <StaggerReveal className={styles.grid}>
        {paginatedResources.map((resource) => (
          <HoverLift key={resource.id}>
            <article>
              <Card
                className={styles.resourceCard}
                onClick={() => navigate(`/resources/${resource.slug || resource.id}`)}
              >
                <div className={styles.cardHeader}>
                  <Subtitle2>{resource.title}</Subtitle2>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={isBookmarked(resource.id) ? <Bookmark24Filled /> : <Bookmark24Regular />}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleBookmark(resource.id, resource.title)
                      }}
                      aria-label={isBookmarked(resource.id) ? t('common.removeBookmark') : t('common.addBookmark')}
                    />
                    <Badge appearance="tint" size="small">
                      {resource.category?.replace('_', ' ') || t('resources.general')}
                    </Badge>
                  </div>
                </div>
                <div className={styles.cardMeta}>
                  <span style={{ fontSize: 'var(--fontSizeBase200)', color: 'var(--colorNeutralForeground3)' }}>
                    {t('common.byAuthor', { author: resource.authorName || t('common.unknown') })}
                  </span>
                  <Badge appearance="outline" size="small">
                    {resource.upvoteCount ?? 0} {t('resources.upvotes')}
                  </Badge>
                </div>
                {resource.subject && (
                  <Badge appearance="outline" size="small" style={{ marginTop: '4px' }}>
                    {resource.subject}
                  </Badge>
                )}
                {resource.tags && <TagList tags={resource.tags} />}
              </Card>
            </article>
          </HoverLift>
        ))}
      </StaggerReveal>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
