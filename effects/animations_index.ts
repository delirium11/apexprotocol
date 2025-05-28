import { Dispatch, RefObject, SetStateAction, useEffect } from "react";

export function useIntersectionObserver 
(
    sectionRef: RefObject<HTMLElement | null>,
    setActiveSection: Dispatch<SetStateAction<boolean>>
): void
{
    useEffect
    (
        () =>
        {
            function observerCallback (entries: IntersectionObserverEntry[])
            {
                for (let i = 0; i < entries.length; i++)
                {
                    setActiveSection(entries[i].isIntersecting);
                }
            }

            let observer: IntersectionObserver;
            let observerOptions: IntersectionObserverInit;

            observerOptions = {threshold: .025};
            observer = new IntersectionObserver(observerCallback, observerOptions);

            if (sectionRef.current)
            {
                observer.observe(sectionRef.current);
            }

            return () => {sectionRef.current && observer.unobserve(sectionRef.current)};

        }, [sectionRef, setActiveSection]
    )
}