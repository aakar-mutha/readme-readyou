import { redirect } from 'next/navigation';

export default function EmbedPage({ params }: { params: { username: string } }) {
  redirect(`/api/generate-svg/${params.username}`);
}