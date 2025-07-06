import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function CommunitySimple() {
  const { id } = useParams<{ id: string }>();
  
  const { data: community, isLoading, error } = useQuery({
    queryKey: [`/api/communities/${id}`],
    enabled: !!id,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !community) {
    return (
      <div>
        <h1>Community Not Found</h1>
        <Link href="/">Back to Home</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>{community.name}</h1>
      <p>Address: {community.address}</p>
      <p>City: {community.city}, {community.state} {community.zipCode}</p>
      {community.phone && <p>Phone: {community.phone}</p>}
      {community.website && (
        <p>Website: <a href={community.website} target="_blank" rel="noopener noreferrer">{community.website}</a></p>
      )}
      <p>Care Types: {community.careTypes?.join(", ") || "None listed"}</p>
      {community.googleRating && (
        <p>Google Rating: {community.googleRating} ({community.googleReviewCount || 0} reviews)</p>
      )}
      <div>
        <Link href="/">← Back to Home</Link>
      </div>
    </div>
  );
}