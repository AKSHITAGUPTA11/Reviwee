import SubscriptionListWrapper from "../../Subscription/SubscriptionListWrapper";

/**
 * Onboarding subscription page:
 * - No side-nav
 * - Only plan selection / buy
 */
const OnboardingSubscriptionWrapper = () => {
  return <SubscriptionListWrapper layoutVariant="onboarding" />;
};

export default OnboardingSubscriptionWrapper;

