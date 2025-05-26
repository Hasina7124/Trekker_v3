// components/Pagination.tsx
import React from 'react'
import { Link } from '@inertiajs/react'
import { Project } from '@/types';

interface Projects {
    project :{
        data: Project[]
        links: any[]
    }
};

export default function Pagination<T>({ project }: Projects) {
    return (
        <div className="flex items-center justify-between mt-6">
            <div className="flex space-x-1">
                {project.links.map((link, index) => (
                    <Link
                        key={index}
                        href={link.url || ''}
                        preserveState
                        className={`px-3 py-1 rounded-md ${
                            link.active
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                        } ${
                            !link.url ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={!link.url}
                    >
                        {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                    </Link>
                ))}
            </div>
        </div>
    )
}
