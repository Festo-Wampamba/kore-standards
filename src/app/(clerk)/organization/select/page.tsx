import { OrganizationList } from "@clerk/nextjs";
import { Suspense } from "react";

type Props = {
  searchParams: Promise<{ redirect?: string }>;
};

export default async function OrganizationSelectPage(props: Props) {
  return (
    <Suspense>
      <SuspendedPage {...props} />
    </Suspense>
  );
}

async function SuspendedPage({ searchParams }: Props) {
  const { redirect } = await searchParams;
  // SECURITY CHECK:
  // 1. Must start with "/" (relative path)
  // 2. Must NOT start with "//" (protocol-relative external link)
  const isInternal = redirect?.startsWith("/") && !redirect.startsWith("//");

  // If it's valid, use it. If not (or if empty), default to "/employer"
  const redirectUrl = isInternal ? redirect : "/employer";

  return (
    <OrganizationList
      hidePersonal
      skipInvitationScreen
      afterSelectOrganizationUrl={redirectUrl}
      afterCreateOrganizationUrl={redirectUrl}
    />
  );
}
