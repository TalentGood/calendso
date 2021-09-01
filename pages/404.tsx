import { ChevronRightIcon } from "@heroicons/react/solid";
import { BookOpenIcon, CheckIcon, DocumentTextIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";
import React from "react";
import Link from "next/link";
import { HeadSeo } from "@components/seo/head-seo";

const links = [
  {
    title: "Home",
    description: "Learn More about us",
    icon: DocumentTextIcon,
    href: "https://edorer.com",
  },
  {
    title: "Blog",
    description: "Read our latest news and articles",
    icon: BookOpenIcon,
    href: "https://blog.edorer.com/",
  },
];

export default function Custom404() {
  const router = useRouter();
  const username = router.asPath.replace("%20", "-");

  return (
    <>
      <HeadSeo
        title="404: This page could not be found."
        description="404: This page could not be found."
        nextSeoProps={{
          nofollow: true,
          noindex: true,
        }}
      />
      <div className="bg-white min-h-screen px-4">
        <main className="max-w-xl mx-auto pb-6 pt-16 sm:pt-24">
          <div className="text-center">
            <p className="text-sm font-semibold text-black uppercase tracking-wide">404 error</p>
            <h1 className="mt-2 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
              This page does not exist.
            </h1>
            <a href="https://checkout.calendso.com" className="inline-block mt-2 text-lg ">
              The username <strong className="text-blue-500">Scheduler.edorer.com{username}</strong> is still
              available. <span className="text-blue-500">Register now</span>.
            </a>
          </div>
          <div className="mt-12">
            <h2 className="text-sm font-semibold text-gray-500 tracking-wide uppercase">Popular pages</h2>

            <ul role="list" className="mt-4">
              <li className="border-2 border-green-500 px-4 py-2">
                <a href="https://checkout.calendso.com" className="relative py-6 flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <span className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-50">
                      <CheckIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-medium text-gray-900">
                      <span className="rounded-sm focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gray-500">
                        <span className="focus:outline-none">
                          <span className="absolute inset-0" aria-hidden="true" />
                          Register <strong className="text-green-500">{username}</strong>
                        </span>
                      </span>
                    </h3>
                    <p className="text-base text-gray-500">Claim your username and schedule events</p>
                  </div>
                  <div className="flex-shrink-0 self-center">
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                </a>
              </li>
            </ul>

            <ul role="list" className="mt-4 border-gray-200 divide-y divide-gray-200">
              {links.map((link, linkIdx) => (
                <li key={linkIdx} className="px-4 py-2">
                  <Link href={link.href}>
                    <a className="relative py-6 flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <span className="flex items-center justify-center h-12 w-12 rounded-lg bg-gray-50">
                          <link.icon className="h-6 w-6 text-gray-700" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-medium text-gray-900">
                          <span className="rounded-sm focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gray-500">
                            <span className="absolute inset-0" aria-hidden="true" />
                            {link.title}
                          </span>
                        </h3>
                        <p className="text-base text-gray-500">{link.description}</p>
                      </div>
                      <div className="flex-shrink-0 self-center">
                        <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link href="/">
                <a className="text-base font-medium text-black hover:text-gray-500">
                  Or go back to dashboard<span aria-hidden="true"> &rarr;</span>
                </a>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
