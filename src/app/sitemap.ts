import { MetadataRoute } from "next";
import { getAppUrl } from "@/utils/url";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = getAppUrl();

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
