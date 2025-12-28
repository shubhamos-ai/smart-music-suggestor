export async function fetchSuggestions(q){
    const res = await fetch(`/suggest?q=${encodeURIComponent(q)}`);
    return await res.json();
}
