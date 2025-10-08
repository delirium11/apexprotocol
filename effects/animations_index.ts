import { Dispatch, RefObject, SetStateAction, useEffect } from "react";

//ANIMATIONS TO BE APPLIED TO THE NAVBAR IN THE INDEX PAGE
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

//ANIMATIONS TO BE APPLIED TO THE CARDS IN THE INDEX PAGE
export function cardsAnimator(): void
{
    const container = Array.from(document.querySelectorAll<HTMLElement>('div'))

    function handleMouseMove (e: MouseEvent, div: HTMLElement)
    {
        const rect = div.getBoundingClientRect();
        
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const offsetX = (e.clientX - centerX) / rect.width;
        const offsetY = (e.clientY - centerY) / rect.height;

        div.style.setProperty('--rotateAboutImageY', `${offsetX * 25}deg`);
        div.style.setProperty('--rotateAboutImageX', `${offsetY * -25}deg`);
    }

    function resetRotation (div: HTMLElement) 
    {
        div.style.removeProperty('--rotateAboutImageY');
        div.style.removeProperty('--rotateAboutImageX');
    }

    for (let i = 0; i < container.length; i++) 
    {
        const div = container[i];
        div.addEventListener('mousemove', (e) => handleMouseMove(e, div));
        div.addEventListener('mouseleave', () => resetRotation(div));
    }
}