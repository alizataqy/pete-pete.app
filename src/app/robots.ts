import { MetadataRoute } from "next";
import { getAppUrl } from "@/utils/url";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = getAppUrl();

    return {
        rules: {
            userAgent: "*",
            allow: ["/", "/pete-pete/new"],
            disallow: [
                "/api/",
                "/tongkrongan/",
                "/profile/",
                "/bon/",
                "/agenda/",
                "/pete-pete/",
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
