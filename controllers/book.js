const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    book.save()
    .then(() => { res.status(201).json({message: 'Livre enregistré !'})})
    .catch(error => { res.status(500).json( { error })})
};

exports.getAllBook = (req, res, next) => {
    Book.find()
        .then(books => {
            if(!books) {
                res.status(404).json({ message : 'Aucun livre trouvé'});
            } else {
                res.status(200).json(books)
            }
        })
        .catch(error => res.status(500).json({ error }));
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if(!book) {
                res.status(404).json({ message : 'Livre non trouvé'});
            } else {
                res.status(200).json(book)
            }
        })
        .catch(error => res.status(500).json({ error }));
};

exports.getBestRatingBook = (req, res, next) => {
    Book.find()
        .sort({ averageRating: -1 }) // Tri par ordre décroissant du rating
        .limit(3) // Limite le résultat à 3 livres
        .then(books => {
            if (!books) {
                res.status(404).json({ message : 'Aucun livre trouvé'})
            } else {
                res.status(200).send(books)
            }
        })
        .catch(error => res.status(500).json({ error }));   
};

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;

    Book.findOne({_id: req.params.id})
        .then((book) => {
            if(!book) {
                res.status(404).json({ message : 'Livre non trouvé'});
            }

            if (book.userId != req.auth.userId) {
                res.status(401).json({ message : 'Non autorisé'});
            } 

            if(bookObject.imageUrl) {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id})
                        .then(() => res.status(200).json({ message : 'Livre modifié!' }))
                        .catch(error => res.status(401).json({ error }));
                }); 
            } else {
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id})
                        .then(() => res.status(200).json({ message : 'Livre modifié!' }))
                        .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(500).json({ error });
        });
 };

 exports.addRatingBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            
            if(!book) {
                res.status(404).json({ message : 'Livre non trouvé'});
            }

            const userRating = book.ratings.find((rating) => rating.userId === req.auth.userId);

            if (userRating) {
                return res.status(401).json({ message: 'Livre déjà noté par cet utilisateur' });
            } else {
               
                book.ratings.addToSet( { userId: req.auth.userId, grade: req.body.rating });               

                const totalRatings = book.ratings.length;
                const sumRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
                book.averageRating = sumRatings / totalRatings;                
 
                Book.findByIdAndUpdate({ _id: req.params.id}, { $set: book, _id: req.params.id }, { new: true })
                    .then((book) => res.status(200).json(book))
                    .catch(error => res.status(500).json({ error }));
            }
            
        })
        .catch((error) => {
            res.status(500).json({ error });
        });
 };

 exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
        .then(book => {
            if(!book) {
                res.status(404).json({ message : 'Livre non trouvé'});
            }
            if (book.userId != req.auth.userId) {
                res.status(401).json({message: 'Non autorisé'});
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                        .catch(error => res.status(500).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
};