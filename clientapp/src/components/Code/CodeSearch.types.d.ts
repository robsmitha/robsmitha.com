
export type SearchItem = {
    sha: string;
    name: string;
    path: string;
    html_url: string;
    repo_name: string;
    repo_description: string | null;
    text_matches: TextMatch[];
}

export type TextMatch = {
    fragment: string
    object_url: string
    object_type: string
    property: string
    matches: Match[]
}

export type Match = {
    indices: number[]
    text: string
}