import { motion } from "framer-motion";
import { Heart, Leaf, Sparkles, Waves } from "lucide-react";
import React from "react";
import { translate } from "../lib/site";
import { Locale } from "../services/api";

interface OurStoryProps {
    locale: Locale;
    textLookup: Record<string, Record<string, string>>;
}

const featureCopy = {
    da: [
        {
            title: "Frisklavet",
            description:
                "Vi holder fokus på smag, tekstur og gode råvarer hver dag.",
        },
        {
            title: "Håndværk",
            description:
                "Små detaljer og gode opskrifter gør en stor forskel i hver kugle.",
        },
        {
            title: "Ved havnen",
            description:
                "Stemningen omkring Marselisborg Havn er en vigtig del af oplevelsen.",
        },
        {
            title: "Tilbagevendende gæster",
            description:
                "Vi vil være et sted man har lyst til at besøge igen og igen.",
        },
    ],
    en: [
        {
            title: "Freshly made",
            description:
                "We focus on flavour, texture, and quality ingredients every day.",
        },
        {
            title: "Flexible V1 setup",
            description:
                "Texts, opening hours, and flavours can be updated from the admin panel.",
        },
        {
            title: "Events and requests",
            description:
                "Guests can send requests without anything being booked automatically.",
        },
        {
            title: "Harbour atmosphere",
            description: "The website should feel like Marselisborg Harbour.",
        },
    ],
    de: [
        {
            title: "Frisch gemacht",
            description:
                "Wir achten taeglich auf Geschmack, Textur und gute Zutaten.",
        },
        {
            title: "Flexibles V1-Setup",
            description:
                "Texte, Oeffnungszeiten und Sorten lassen sich im Adminbereich pflegen.",
        },
        {
            title: "Events und Anfragen",
            description:
                "Gaeste senden Anfragen, ohne dass automatisch gebucht wird.",
        },
        {
            title: "Hafenatmosphaere",
            description:
                "Die Website soll das Gefuehl von Marselisborg Hafen vermitteln.",
        },
    ],
};

const icons = [Heart, Leaf, Sparkles, Waves];

const OurStory: React.FC<OurStoryProps> = ({ locale, textLookup }) => {
    const items = featureCopy[locale];

    return (
        <section id="about" className="bg-amber-50 px-4 py-20">
            <div className="mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-14 max-w-3xl"
                >
                    <h2 className="font-serif text-4xl font-bold text-stone-900 md:text-5xl">
                        {translate(
                            textLookup,
                            locale,
                            "about_title",
                            "Our story",
                        )}
                    </h2>
                    <p className="mt-5 text-lg leading-8 text-stone-600">
                        {translate(
                            textLookup,
                            locale,
                            "about_subtitle",
                            "Homemade ice cream, quality ingredients, and a place people return to.",
                        )}
                    </p>
                </motion.div>

                <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="rounded-[2rem] bg-gradient-to-br from-rose-200 via-rose-100 to-pink-50 p-8 text-stone-900 shadow-xl ring-1 ring-rose-300/70"
                    >
                        <div className="text-xs uppercase tracking-[0.4em] text-rose-600">
                            Ishuset
                        </div>
                        <h3 className="mt-4 font-serif text-3xl">
                            {translate(
                                textLookup,
                                locale,
                                "about_heading",
                                "Homemade with care",
                            )}
                        </h3>
                        <div className="mt-6 space-y-4 text-base leading-8 text-stone-700">
                            <p>
                                {translate(
                                    textLookup,
                                    locale,
                                    "about_body_1",
                                    "At Ishuset we work with classic flavours, seasonal favourites, and ingredients we are proud of.",
                                )}
                            </p>
                            <p>
                                {translate(
                                    textLookup,
                                    locale,
                                    "about_body_2",
                                    "We want event requests and daily website updates to stay simple for both guests and staff.",
                                )}
                            </p>
                        </div>
                    </motion.div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        {items.map((feature, index) => {
                            const Icon = icons[index];
                            return (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="rounded-[1.75rem] bg-gradient-to-br from-sky-100 to-cyan-100 p-6 shadow-sm"
                                >
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h4 className="text-xl font-semibold text-stone-900">
                                        {feature.title}
                                    </h4>
                                    <p className="mt-3 text-sm leading-7 text-stone-600">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default OurStory;
