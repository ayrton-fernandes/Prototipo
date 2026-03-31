export function getImagePath(imageName: string): string {
    const prePath = process.env.NEXT_PUBLIC_BASE_PATH
        ? `${process.env.NEXT_PUBLIC_BASE_PATH}/`
        : "";

    return `${prePath}${imageName}`;
}
