import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ceban-pertama.vercel.app";

    // Static public routes in our application
    const routes = [
        "",
        "/pete-pete/new",
        "/login",
        "/register",
    ];

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : "monthly",
        priority: route === "" ? 1.0 : route === "/pete-pete/new" ? 0.9 : 0.6,
    }));
}
