export default function JsonValue({ value }: { value: any }) {
    console.log("Type de value :", typeof value);
    console.log("Value :", value);

    // Pour vérifier si c'est un objet ou une chaîne
    if (typeof value === "string") {
        return <p className="font-medium">{value}</p>;
    }

    if (typeof value === "object" && value !== null) {
        return (
            <div className="space-y-1">
                {Object.entries(value).map(([key, val]) => (
                    <p key={key} className="font-medium">{String(val)}</p>
                ))}
            </div>
        );
    }

    // Si autre chose, afficher en brut
    return String(value);
}
