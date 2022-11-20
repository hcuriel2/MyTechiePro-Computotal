interface Survey {
    category: {
        name: string;
        survey: {
            question: string;
            key: string;
            contents: string[];
        }
    }
}

export default Survey