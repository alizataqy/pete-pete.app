import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ceban-pertama.vercel.app";

    // Static routes in our application
    const routes = [
        "",
        "/login",
        "/register",
        "/dashboard",
        "/profile",
        "/pete-pete/new",
    ];

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : "monthly",
        priority: route === "" ? 1.0 : route.startsWith("/dashboard") || route.startsWith("/pete-pete") ? 0.8 : 0.5,
    }));
}
