import { MetadataRoute } from "next";
import { getAppUrl } from "@/utils/url";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = getAppUrl();

    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/api/", "/tongkrongan/", "/profile/"],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
