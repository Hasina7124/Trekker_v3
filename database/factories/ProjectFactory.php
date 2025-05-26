<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Project::class;

    
    public function definition(): array
    {
        $titles = [
            "Développement d’une application mobile bancaire",
            "Création d’un système de gestion scolaire",
            "Mise en place d’un ERP pour une PME",
            "Refonte du site web institutionnel",
            "Automatisation du système de facturation",
            "Déploiement d’un chatbot pour le support client",
            "Plateforme de e-learning sur mesure",
            "Conception d’une solution de suivi logistique",
            "Développement d’un intranet collaboratif",
            "Mise en œuvre d’un CRM personnalisé",
            "Application de réservation pour hôtels",
            "Système de vote électronique sécurisé",
            "Plateforme de recrutement en ligne",
            "Gestion électronique de documents (GED)",
            "Application de covoiturage locale",
            "Plateforme de gestion de projets Agile",
            "Développement d’une API pour services météo",
            "Outil d’analyse des ventes en temps réel",
            "Système de gestion des ressources humaines",
            "Refonte complète d’une boutique en ligne",
            "Application mobile pour la gestion de santé",
            "Plateforme d'enchères en temps réel",
            "Système de contrôle d’accès RFID",
            "Dashboard pour données financières",
            "Outil de planification de production industrielle",
        ];

        $descriptions = [
            "Application mobile destinée aux clients d’une banque pour gérer leurs comptes et paiements.",
            "Système complet pour gérer élèves, enseignants, notes et emplois du temps.",
            "ERP modulaire incluant gestion des stocks, achats, ventes et comptabilité.",
            "Modernisation d’un site web vitrine pour un ministère.",
            "Automatisation de la génération, l’envoi et l’archivage des factures.",
            "Intégration d’un chatbot AI pour répondre aux questions des clients 24h/24.",
            "Développement d’une plateforme interactive pour les cours en ligne.",
            "Outil permettant de suivre les colis et les itinéraires en temps réel.",
            "Intranet avec gestion des documents, projets et calendrier partagé.",
            "CRM avec tableaux de bord, gestion des leads et intégration mailing.",
            "App mobile permettant aux utilisateurs de réserver des chambres d’hôtel.",
            "Système numérique sécurisé pour des élections internes d’entreprise.",
            "Site web dédié à la mise en relation de recruteurs et de candidats.",
            "Outil de numérisation, classement et partage de documents internes.",
            "Application communautaire de mise en relation pour le covoiturage.",
            "Plateforme pour planifier, suivre et livrer les projets en méthode Agile.",
            "API RESTful fournissant les données météorologiques géolocalisées.",
            "Interface en temps réel pour suivre les performances commerciales.",
            "Solution complète pour le recrutement, paie et congés du personnel.",
            "Refonte UX/UI d’une boutique e-commerce existante avec CMS Laravel.",
            "Application de suivi des rendez-vous médicaux et traitements.",
            "Solution de ventes aux enchères avec paiement intégré.",
            "Développement d’un système sécurisé de contrôle d’accès par badge RFID.",
            "Tableau de bord pour la visualisation de KPI financiers multi-sources.",
            "Système avancé pour organiser la production selon la demande.",
        ];

        $budgets = [
            1030000, 1250000, 1478000, 1600000, 1755000,
            1820000, 1900000, 2000000, 2100000, 2200000,
            2300000, 2400000, 2500000, 2600000, 2700000,
            2800000, 2900000, 3000000, 1100000, 1150000,
            1200000, 1300000, 1350000, 1400000, 1500000,
        ];
        
        

        return [
            'title' => $this->faker->sentence(4),
            'description' => $this->faker->paragraph(3),
            'status' => $this->faker->randomElement(['pending', 'active', 'completed', 'rejected']),
            'budget' => $this->faker->randomFloat(2, 1000, 100000),
            'admin_id' => User::factory(['role' => 'admin']),
            'manager_id' => User::factory(['role' => 'user']),
            'start_date' => $this->faker->dateTimeBetween('-1 month', '+1 month'),
            'end_date' => $this->faker->dateTimeBetween('+2 months', '+1 year'),
        ];
    }
}
