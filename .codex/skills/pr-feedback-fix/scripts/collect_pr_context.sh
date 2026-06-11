#!/usr/bin/env bash
set -euo pipefail

command -v gh >/dev/null || {
  printf 'gh is required\n' >&2
  exit 1
}
command -v jq >/dev/null || {
  printf 'jq is required\n' >&2
  exit 1
}

pr_ref="${1:-}"

if [[ -n "$pr_ref" ]]; then
  pr="$(gh pr view "$pr_ref" --json number,url,title,body,state,baseRefName,headRefName,headRefOid,headRepository,headRepositoryOwner,isCrossRepository,author,closingIssuesReferences)"
else
  pr="$(gh pr view --json number,url,title,body,state,baseRefName,headRefName,headRefOid,headRepository,headRepositoryOwner,isCrossRepository,author,closingIssuesReferences)"
fi

repo="$(jq -r '.url | capture("github.com/(?<repo>[^/]+/[^/]+)/pull/").repo' <<<"$pr")"
number="$(jq -r .number <<<"$pr")"
comments="$(gh api --paginate "repos/$repo/issues/$number/comments" | jq -s 'add // []')"
reviews="$(gh api --paginate "repos/$repo/pulls/$number/reviews" | jq -s 'add // []')"
review_comments="$(gh api --paginate "repos/$repo/pulls/$number/comments" | jq -s 'add // []')"
threads="$(gh api graphql --paginate -f owner="${repo%/*}" -f name="${repo#*/}" -F number="$number" -f query='
query($owner:String!, $name:String!, $number:Int!, $endCursor:String) {
  repository(owner:$owner, name:$name) {
    pullRequest(number:$number) {
      reviewThreads(first:100, after:$endCursor) {
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          originalLine
          comments(first:1) {
            nodes {
              id
              databaseId
              body
              url
              createdAt
              author { login }
            }
          }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
}' | jq -s '[.[].data.repository.pullRequest.reviewThreads.nodes[]]')"

issues="$(jq -c '.closingIssuesReferences // []' <<<"$pr")"
issue_details='[]'
while IFS= read -r issue_url; do
  [[ -n "$issue_url" ]] || continue
  issue="$(gh issue view "$issue_url" --json number,url,title,body,state,comments)"
  issue_details="$(jq --argjson issue "$issue" '. + [$issue]' <<<"$issue_details")"
done < <(jq -r '.[].url' <<<"$issues")

jq -n \
  --arg repo "$repo" \
  --argjson pr "$pr" \
  --argjson comments "$comments" \
  --argjson reviews "$reviews" \
  --argjson review_comments "$review_comments" \
  --argjson review_threads "$threads" \
  --argjson issues "$issue_details" \
  '{
    repository: $repo,
    collected_at: (now | todateiso8601),
    pr: $pr,
    comments: $comments,
    reviews: $reviews,
    review_comments: $review_comments,
    review_threads: $review_threads,
    linked_issues: $issues
  }'
