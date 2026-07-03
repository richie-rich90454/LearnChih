import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Pagination } from '../Pagination'

const meta: Meta<typeof Pagination> = {
  title: 'Shared/Pagination',
  component: Pagination,
}

export default meta
type Story = StoryObj<typeof Pagination>

function InteractivePagination(props: { currentPage: number; totalPages: number }) {
  const [page, setPage] = useState(props.currentPage)
  return <Pagination currentPage={page} totalPages={props.totalPages} onPageChange={setPage} />
}

export const FirstPage: Story = {
  render: () => <InteractivePagination currentPage={1} totalPages={5} />,
}

export const MiddlePage: Story = {
  render: () => <InteractivePagination currentPage={3} totalPages={5} />,
}

export const LastPage: Story = {
  render: () => <InteractivePagination currentPage={5} totalPages={5} />,
}

export const SinglePage: Story = {
  render: () => <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />,
}
